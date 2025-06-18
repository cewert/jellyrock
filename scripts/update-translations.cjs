const fs = require('fs');
const path = require('path');
const fg = require('fast-glob');
const xml2js = require('xml2js'); // Added to parse existing XML

// Configuration
const ROOT_DIR = process.argv[2] || '.';
const OUTPUT_FILE = 'locale/en_US/translations.ts';
const SETTINGS_JSON_PATH = path.join(ROOT_DIR, 'settings/settings.json');
const FILE_PATTERNS = [
  '**/*.brs',
  '**/*.bs',
  '!node_modules/**',
  '!/test-app/**',
  '!**/roku_modules/**',
  '!build/**',
  '!out/**'
];

// Parse existing TS file to extract comments
async function parseExistingTranslations(filePath) {
  const commentsMap = new Map();

  if (!fs.existsSync(filePath)) {
    return commentsMap;
  }

  try {
    const xml = fs.readFileSync(filePath, 'utf8');
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(xml);

    if (result.TS?.context?.[0]?.message) {
      result.TS.context[0].message.forEach(msg => {
        const source = msg.source?.[0];
        const extracomment = msg.extracomment?.[0];
        if (source && extracomment) {
          commentsMap.set(source, extracomment);
        }
      });
    }
  } catch (error) {
    console.warn(`Error parsing existing translations.ts: ${error.message}`);
    process.exit(1);
  }

  return commentsMap;
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
    translations.add(translation);
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
          strings.add(obj[key]);
        }
      }
      traverse(obj[key]);
    }
  }

  traverse(jsonData);
  return strings;
}

// Generate TS XML content
function generateTsXml(translations, commentsMap) {
  let xml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE TS>
<TS version="2.0" language="en_US" sourcelanguage="en_US">
  <defaultcodec>UTF-8</defaultcodec>
  <context>
    <name>default</name>\n`;

  const sortedTranslations = Array.from(translations).sort();
  sortedTranslations.forEach(translation => {
    // Escape XML special characters
    const escapedTranslation = translation
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

    xml += `    <message>
      <source>${escapedTranslation}</source>
      <translation>${escapedTranslation}</translation>`;

    // Add extracomment if it exists for this translation
    if (commentsMap.has(translation)) {
      const escapedComment = commentsMap.get(translation)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
      xml += `
      <extracomment>${escapedComment}</extracomment>`;
    }

    xml += `
    </message>\n`;
  });

  xml += `  </context>
</TS>`;
  return xml;
}

async function extractTranslations() {
  // First parse existing translations to preserve comments
  const existingComments = await parseExistingTranslations(path.join(ROOT_DIR, OUTPUT_FILE));
  const allTranslations = new Set();
  var stringCount = 0;

  // 1. Extract from BrightScript files
  const files = await fg(FILE_PATTERNS, { cwd: ROOT_DIR, absolute: true });
  for (const filePath of files) {
    try {
      const code = fs.readFileSync(filePath, 'utf8');
      const fileTranslations = extractTrCalls(code);
      fileTranslations.forEach(t => {
        allTranslations.add(t);
        stringCount++;
      });
    } catch (error) {
      console.warn(`Error reading ${path.relative(ROOT_DIR, filePath)}: ${error.message}`);
      process.exit(1);
    }
  }
  console.log(`Found ${stringCount} tr() strings in ${files.length} bright(er)script files`);

  // 2. Extract from settings.json
  try {
    const jsonData = JSON.parse(fs.readFileSync(SETTINGS_JSON_PATH, 'utf8'));
    const jsonStrings = extractJsonStrings(jsonData);
    jsonStrings.forEach(s => allTranslations.add(s));
    console.log(`Found ${jsonStrings.size} strings in settings/settings.json`);
  } catch (error) {
    console.warn(`Error processing settings/settings.json: ${error.message}`);
    process.exit(1);
  }

  // Generate and write TS XML file
  const tsXml = generateTsXml(allTranslations, existingComments);
  fs.writeFileSync(
    path.join(ROOT_DIR, OUTPUT_FILE),
    tsXml
  );

  console.log(`\nFound ${allTranslations.size} unique strings`);
  console.log(`Preserved ${existingComments.size} existing extracomments`);
  console.log(`Output written to ${OUTPUT_FILE}`);
}

extractTranslations().catch(console.error);
