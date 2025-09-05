#!/usr/bin/env node

// Cross-platform XML translation linter for Jellyfin Roku Client
// Validates XML syntax and checks for duplicate source strings
// Compatible with Windows, macOS, and Linux

const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const fg = require('fast-glob');

// Configuration
const LOCALE_DIR = path.join(process.cwd(), 'locale');
const TRANSLATION_FILE_PATTERN = '**/translations.ts';

// ANSI color codes for better terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

// Cross-platform console styling
function colorize(text, color) {
  // Skip colors on Windows CMD if not supporting ANSI
  if (process.platform === 'win32' && !process.env.FORCE_COLOR && !process.stdout.isTTY) {
    return text;
  }
  return `${colors[color]}${text}${colors.reset}`;
}

function logError(message, filePath = null, lineNumber = null) {
  const prefix = colorize('✗ ERROR:', 'red');
  let output = `${prefix} ${message}`;
  
  if (filePath) {
    const relativePath = path.relative(process.cwd(), filePath);
    output += ` ${colorize('in', 'magenta')} ${colorize(relativePath, 'cyan')}`;
  }
  
  if (lineNumber) {
    output += ` ${colorize('at line', 'magenta')} ${colorize(lineNumber, 'yellow')}`;
  }
  
  console.error(output);
}

function logWarning(message, filePath = null) {
  const prefix = colorize('⚠ WARNING:', 'yellow');
  let output = `${prefix} ${message}`;
  
  if (filePath) {
    const relativePath = path.relative(process.cwd(), filePath);
    output += ` ${colorize('in', 'magenta')} ${colorize(relativePath, 'cyan')}`;
  }
  
  console.warn(output);
}

function logSuccess(message) {
  const prefix = colorize('✓ SUCCESS:', 'green');
  console.log(`${prefix} ${message}`);
}

function logInfo(message) {
  const prefix = colorize('ℹ INFO:', 'blue');
  console.log(`${prefix} ${message}`);
}

/**
 * Validates XML syntax using xml2js parser
 * @param {string} filePath - Path to the XML file
 * @param {string} xmlContent - Content of the XML file
 * @returns {Promise<{valid: boolean, error?: string, lineNumber?: number}>}
 */
async function validateXmlSyntax(filePath, xmlContent) {
  try {
    const parser = new xml2js.Parser({
      strict: true,
      normalize: true,
      normalizeTags: false,
      explicitArray: true
    });
    
    await parser.parseStringPromise(xmlContent);
    return { valid: true };
  } catch (error) {
    // Try to extract line number from error message
    const lineMatch = error.message.match(/Line:\s*(\d+)/i);
    const lineNumber = lineMatch ? parseInt(lineMatch[1], 10) : null;
    
    return {
      valid: false,
      error: error.message,
      lineNumber
    };
  }
}

/**
 * Extracts source strings from parsed XML translation data
 * @param {Object} parsedXml - Parsed XML object from xml2js
 * @returns {Array<{source: string, line: number}>}
 */
function extractSourceStrings(parsedXml) {
  const sources = [];
  
  if (!parsedXml?.TS?.context) {
    return sources;
  }
  
  const contexts = Array.isArray(parsedXml.TS.context) 
    ? parsedXml.TS.context 
    : [parsedXml.TS.context];
  
  contexts.forEach(context => {
    if (!context.message) return;
    
    const messages = Array.isArray(context.message) 
      ? context.message 
      : [context.message];
    
    messages.forEach((message, index) => {
      if (message?.source?.[0]) {
        const sourceText = message.source[0].toString().trim();
        if (sourceText) {
          sources.push({
            source: sourceText,
            line: index + 1 // Approximate line number (not perfect but helpful)
          });
        }
      }
    });
  });
  
  return sources;
}

/**
 * Finds duplicate source strings in a list
 * @param {Array<{source: string, line: number}>} sources - Array of source objects
 * @returns {Array<{source: string, lines: Array<number>}>}
 */
function findDuplicates(sources) {
  const sourceMap = new Map();
  
  sources.forEach(({ source, line }) => {
    if (!sourceMap.has(source)) {
      sourceMap.set(source, []);
    }
    sourceMap.get(source).push(line);
  });
  
  return Array.from(sourceMap.entries())
    .filter(([, lines]) => lines.length > 1)
    .map(([source, lines]) => ({ source, lines }));
}

/**
 * Validates a single translation file
 * @param {string} filePath - Path to the translation file
 * @returns {Promise<{valid: boolean, errors: Array, warnings: Array}>}
 */
async function validateTranslationFile(filePath) {
  const errors = [];
  const warnings = [];
  
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      errors.push(`Translation file not found: ${filePath}`);
      return { valid: false, errors, warnings };
    }
    
    // Read file content
    const xmlContent = fs.readFileSync(filePath, 'utf8');
    
    // Validate XML syntax
    const syntaxResult = await validateXmlSyntax(filePath, xmlContent);
    if (!syntaxResult.valid) {
      logError(`XML syntax error: ${syntaxResult.error}`, filePath, syntaxResult.lineNumber);
      errors.push(`XML syntax error: ${syntaxResult.error}`);
      return { valid: false, errors, warnings };
    }
    
    // Parse XML for duplicate checking
    const parser = new xml2js.Parser({ explicitArray: true });
    const parsedXml = await parser.parseStringPromise(xmlContent);
    
    // Extract and check for duplicates
    const sources = extractSourceStrings(parsedXml);
    const duplicates = findDuplicates(sources);
    
    if (duplicates.length > 0) {
      duplicates.forEach(({ source, lines }) => {
        logError(
          `Duplicate source string found: "${source}" appears ${lines.length} times`,
          filePath
        );
        logError(`  → Found at lines: ${lines.join(', ')}`, filePath);
        errors.push(`Duplicate source: "${source}" (lines: ${lines.join(', ')})`);
      });
    }
    
    // Additional validation checks
    if (sources.length === 0) {
      logWarning('No translation messages found in file', filePath);
      warnings.push('No translation messages found');
    }
    
    // Check for empty source strings
    const emptySources = sources.filter(({ source }) => !source.trim());
    if (emptySources.length > 0) {
      logWarning(`Found ${emptySources.length} empty source strings`, filePath);
      warnings.push(`${emptySources.length} empty source strings found`);
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      stats: {
        totalMessages: sources.length,
        duplicateCount: duplicates.length,
        emptySourceCount: emptySources.length
      }
    };
    
  } catch (error) {
    const errorMessage = `Unexpected error: ${error.message}`;
    logError(errorMessage, filePath);
    errors.push(errorMessage);
    return { valid: false, errors, warnings };
  }
}

/**
 * Main function to lint all translation files
 */
async function lintTranslations() {
  console.log(colorize('\n🔍 Linting XML Translation Files', 'bold'));
  console.log(colorize('=====================================', 'blue'));
  
  try {
    // Find all translation files
    const pattern = path.join(LOCALE_DIR, TRANSLATION_FILE_PATTERN).replace(/\\/g, '/');
    const translationFiles = await fg([pattern], {
      absolute: true,
      onlyFiles: true
    });
    
    if (translationFiles.length === 0) {
      logWarning(`No translation files found in ${LOCALE_DIR}`);
      logInfo('Expected pattern: locale/**/translations.ts');
      process.exit(1);
    }
    
    logInfo(`Found ${translationFiles.length} translation file(s) to validate`);
    console.log('');
    
    let totalErrors = 0;
    let totalWarnings = 0;
    let validFiles = 0;
    const results = [];
    
    // Validate each file
    for (const filePath of translationFiles) {
      const relativePath = path.relative(process.cwd(), filePath);
      console.log(colorize(`Validating: ${relativePath}`, 'cyan'));
      
      const result = await validateTranslationFile(filePath);
      results.push({ filePath: relativePath, ...result });
      
      if (result.valid) {
        logSuccess(`Valid XML syntax, no duplicates found`);
        if (result.stats) {
          console.log(`  → ${result.stats.totalMessages} translation messages`);
        }
        validFiles++;
      } else {
        totalErrors += result.errors.length;
      }
      
      if (result.warnings.length > 0) {
        totalWarnings += result.warnings.length;
      }
      
      console.log('');
    }
    
    // Summary
    console.log(colorize('Summary:', 'bold'));
    console.log(colorize('========', 'blue'));
    console.log(`Files processed: ${translationFiles.length}`);
    console.log(`${colorize('Valid files:', 'green')} ${validFiles}`);
    console.log(`${colorize('Files with errors:', 'red')} ${translationFiles.length - validFiles}`);
    console.log(`${colorize('Total errors:', 'red')} ${totalErrors}`);
    console.log(`${colorize('Total warnings:', 'yellow')} ${totalWarnings}`);
    
    if (totalErrors > 0) {
      console.log('');
      logError('Translation validation failed!');
      console.log('\nTo fix duplicate issues:');
      console.log('1. Remove duplicate <source> entries from translation files');
      console.log('2. Ensure each translation string appears only once');
      console.log('3. Run this script again to verify fixes');
      
      process.exit(1);
    } else {
      console.log('');
      logSuccess('All translation files are valid!');
      
      if (totalWarnings > 0) {
        console.log(`\n${colorize('Note:', 'yellow')} ${totalWarnings} warning(s) found. Please review them when possible.`);
      }
      
      process.exit(0);
    }
    
  } catch (error) {
    logError(`Failed to lint translations: ${error.message}`);
    console.error('\nStack trace:');
    console.error(error.stack);
    process.exit(1);
  }
}

// Handle CLI execution
if (require.main === module) {
  lintTranslations();
}

module.exports = {
  lintTranslations,
  validateTranslationFile,
  validateXmlSyntax,
  findDuplicates,
  extractSourceStrings
};