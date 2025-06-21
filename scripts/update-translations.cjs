// This script automatically generates the en_US/translations.ts file
// by scanning the codebase for translation strings in BrightScript files, XML files, and settings/settings.json.

const fs = require('fs');
const path = require('path');
const fg = require('fast-glob');
const xml2js = require('xml2js');

// Configuration
const ROOT_DIR = process.argv[2] || '.';
const OUTPUT_FILE = 'locale/en_US/translations.ts';
const SETTINGS_JSON_PATH = path.join(ROOT_DIR, 'settings/settings.json');
const BRS_PATTERNS = [
  'source/**/*.brs',
  'source/**/*.bs',
  'components/**/*.brs',
  'components/**/*.bs',
  '!node_modules/**',
  '!/test-app/**',
  '!**/roku_modules/**',
  '!build/**',
  '!out/**'
];
const XML_PATTERNS = [
  'components/**/*.xml',
  '!node_modules/**',
  '!/test-app/**',
  '!**/roku_modules/**',
  '!build/**',
  '!out/**'
];

// Helper function to check if string should be excluded
function shouldExcludeString(str) {
  // Exclude single non-alphabet characters
  return str.length === 1 && !/[a-zA-Z]/.test(str);
}

// Count messages in XML file
async function countMessagesInFile(filePath) {
  if (!fs.existsSync(filePath)) {
    process.exit(1);
  }

  try {
    const xml = fs.readFileSync(filePath, 'utf8');
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(xml);
    return result.TS?.context?.[0]?.message?.length || 0;
  } catch (error) {
    console.warn(`Error counting messages in ${filePath}: ${error.message}`);
    process.exit(1);
  }
}

// Parse existing TS file to extract translations and comments
async function parseExistingTranslations(filePath) {
  const translationsMap = new Map();

  if (!fs.existsSync(filePath)) {
    process.exit(1);
  }

  try {
    const xml = fs.readFileSync(filePath, 'utf8');
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(xml);
    const messageCount = result.TS?.context?.[0]?.message?.length || 0;

    if (result.TS?.context?.[0]?.message) {
      result.TS.context[0].message.forEach(msg => {
        const source = msg.source?.[0];
        const translation = msg.translation?.[0];
        const comment = msg.comment?.[0] || msg.extracomment?.[0];

        if (source) {
          translationsMap.set(source, {
            source: source,
            translation: translation || source,
            comment: comment
          });
        }
      });
    }

    return { translations: translationsMap, count: messageCount };
  } catch (error) {
    console.warn(`Error parsing existing translations.ts: ${error.message}`);
    process.exit(1);
  }
}

// Extract from BrightScript files
function extractTrCalls(code) {
  const translations = new Set();
  const regex = /\btr\((["'`])((?:(?!\1).|\\\1|\n)*)\1\)/g;

  let match;
  while ((match = regex.exec(code)) !== null) {
    const translation = match[2]
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!shouldExcludeString(translation)) {
      translations.add(translation);
    }
  }
  return translations;
}

// Extract from JSON settings file
function extractJsonStrings(jsonData) {
  const strings = new Set();

  function traverse(obj) {
    if (typeof obj !== 'object' || obj === null) return;

    for (const key in obj) {
      if (key === 'title' || key === 'description') {
        if (typeof obj[key] === 'string') {
          const str = obj[key].trim();
          if (!shouldExcludeString(str)) {
            strings.add(str);
          }
        }
      }
      traverse(obj[key]);
    }
  }

  traverse(jsonData);
  return strings;
}

// Extract text attributes from XML files
async function extractXmlTextParams(filePath) {
  const texts = new Set();
  const relativePath = path.relative(ROOT_DIR, filePath);

  try {
    const xml = fs.readFileSync(filePath, 'utf8');
    const parser = new xml2js.Parser({
      explicitChildren: true,
      preserveChildrenOrder: true
    });
    const result = await parser.parseStringPromise(xml);

    function traverse(node) {
      if (!node) return;

      // Check for text attribute
      if (node.$ && node.$.text && node.$.text.trim() !== '') {
        const textValue = node.$.text.trim();
        if (!shouldExcludeString(textValue)) {
          texts.add(textValue);
        }
      }

      // Recursively check children
      if (node.$$) {
        node.$$.forEach(child => traverse(child));
      }
    }

    if (result.component) {
      traverse(result.component);
    }

    return texts;
  } catch (error) {
    console.warn(`Error processing XML file ${relativePath}: ${error.message}`);
    process.exit(1);
  }
}

// Generate TS XML content with sorted messages
function generateTsXml(usedTranslations, existingTranslations) {
  // Create final sorted array of translations
  const sortedMessages = Array.from(usedTranslations)
    .map(source => {
      const existing = existingTranslations.get(source);
      return {
        source: source,
        translation: existing?.translation || source,
        comment: existing?.comment
      };
    })
    .sort((a, b) => a.source.localeCompare(b.source));

  // Generate XML
  let xml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE TS>
<TS version="2.0" language="en_US" sourcelanguage="en_US">
  <defaultcodec>UTF-8</defaultcodec>
  <context>
    <name>default</name>\n`;

  sortedMessages.forEach(({ source, translation, comment }) => {
    const escapedSource = escapeXml(source);
    const escapedTranslation = escapeXml(translation);

    xml += `    <message>
      <source>${escapedSource}</source>
      <translation>${escapedTranslation}</translation>`;

    if (comment) {
      xml += `
      <extracomment>${escapeXml(comment)}</extracomment>`;
    }

    xml += `
    </message>\n`;
  });

  xml += `  </context>
</TS>`;
  return xml;
}

function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function extractTranslations() {
  console.log('Starting translation extraction...');

  // Get initial message count
  const initialCount = await countMessagesInFile(path.join(ROOT_DIR, OUTPUT_FILE));
  console.log(`Initial translation count: ${initialCount}`);

  // Parse existing translations
  const { translations: existingTranslations } = await parseExistingTranslations(path.join(ROOT_DIR, OUTPUT_FILE));

  const usedTranslations = new Set();

  // 1. Process BrightScript files
  console.log('\nScanning BrightScript files...');
  const brsFiles = await fg(BRS_PATTERNS, { cwd: ROOT_DIR, absolute: true });
  for (const filePath of brsFiles) {
    try {
      const code = fs.readFileSync(filePath, 'utf8');
      const fileTranslations = extractTrCalls(code);
      fileTranslations.forEach(t => usedTranslations.add(t));
    } catch (error) {
      console.warn(`Error reading ${path.relative(ROOT_DIR, filePath)}: ${error.message}`);
      process.exit(1);
    }
  }
  console.log(`Found ${usedTranslations.size} strings in BrightScript files`);

  // 2. Process XML files
  console.log('\nScanning XML component files...');
  const xmlFiles = await fg(XML_PATTERNS, { cwd: ROOT_DIR, absolute: true });
  for (const filePath of xmlFiles) {
    try {
      const xmlTexts = await extractXmlTextParams(filePath);
      xmlTexts.forEach(t => usedTranslations.add(t));
    } catch (error) {
      console.warn(`Error reading ${path.relative(ROOT_DIR, filePath)}: ${error.message}`);
      process.exit(1);
    }
  }
  console.log(`Found ${usedTranslations.size} total strings after XML scan`);

  // 3. Process settings.json
  console.log('\nScanning settings.json...');
  try {
    const jsonData = JSON.parse(fs.readFileSync(SETTINGS_JSON_PATH, 'utf8'));
    const jsonStrings = extractJsonStrings(jsonData);
    jsonStrings.forEach(s => usedTranslations.add(s));
    console.log(`Found ${jsonStrings.size} strings in settings.json`);
  } catch (error) {
    console.warn(`Error processing settings.json: ${error.message}`);
    process.exit(1);
  }

  // Generate final output with only used translations
  console.log(`\nGenerating output with ${usedTranslations.size} strings...`);
  const tsXml = generateTsXml(usedTranslations, existingTranslations);
  fs.writeFileSync(path.join(ROOT_DIR, OUTPUT_FILE), tsXml);

  // Report final results
  const finalCount = await countMessagesInFile(path.join(ROOT_DIR, OUTPUT_FILE));
  console.log(`\nOld message count in ${OUTPUT_FILE}: ${initialCount}`);
  console.log(`New message count in ${OUTPUT_FILE}: ${finalCount}`);

  const newCount = Array.from(usedTranslations).filter(t => !existingTranslations.has(t)).length;
  const removedCount = initialCount - (finalCount - newCount);

  console.log('\n=== Summary ===');
  console.log(`- Total strings in codebase: ${usedTranslations.size}`);
  console.log(`- Preserved translations: ${finalCount - newCount}`);
  console.log(`- New translations added: ${newCount}`);
  console.log(`- Old translations removed: ${removedCount}`);
}

extractTranslations().catch(console.error);
