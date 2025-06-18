const fs = require('fs');
const path = require('path');
const fg = require('fast-glob');
const xml2js = require('xml2js');

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
    return { translations: translationsMap, count: 0 };
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

// Generate TS XML content with sorted messages
function generateTsXml(newTranslations, existingTranslations) {
  // Combine all translations
  const allTranslations = new Map();

  // First add all existing translations (preserving their exact case)
  existingTranslations.forEach(value => {
    allTranslations.set(value.source, {
      source: value.source,
      translation: value.translation,
      comment: value.comment
    });
  });

  // Then add new translations
  newTranslations.forEach(source => {
    // Only add if we don't have this exact case already
    if (!allTranslations.has(source)) {
      allTranslations.set(source, {
        source: source,
        translation: source, // Default to source as translation
        comment: undefined
      });
    }
  });

  // Convert to array and sort alphabetically by source (case-insensitive)
  const sortedMessages = Array.from(allTranslations.values())
    .sort((a, b) => a.source.localeCompare(b.source));

  // Generate XML
  let xml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE TS>
<TS version="2.0" language="en_US" sourcelanguage="en_US">
  <defaultcodec>UTF-8</defaultcodec>
  <context>
    <name>default</name>\n`;

  // Add all messages in alphabetical order
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
  // Get initial message count
  const initialCount = await countMessagesInFile(path.join(ROOT_DIR, OUTPUT_FILE));

  // Parse existing translations to preserve them
  const { translations: existingTranslations, count: parsedCount } = await parseExistingTranslations(path.join(ROOT_DIR, OUTPUT_FILE));
  console.log(`Parsed ${parsedCount} existing translations`);

  const newTranslations = new Set();

  // 1. Extract from BrightScript files
  const files = await fg(FILE_PATTERNS, { cwd: ROOT_DIR, absolute: true });
  for (const filePath of files) {
    try {
      const code = fs.readFileSync(filePath, 'utf8');
      const fileTranslations = extractTrCalls(code);
      fileTranslations.forEach(t => newTranslations.add(t));
    } catch (error) {
      console.warn(`Error reading ${path.relative(ROOT_DIR, filePath)}: ${error.message}`);
      process.exit(1);
    }
  }

  // 2. Extract from settings.json
  try {
    const jsonData = JSON.parse(fs.readFileSync(SETTINGS_JSON_PATH, 'utf8'));
    const jsonStrings = extractJsonStrings(jsonData);
    jsonStrings.forEach(s => newTranslations.add(s));
    console.log(`Found ${jsonStrings.size} strings in settings.json`);
  } catch (error) {
    console.warn(`Error processing settings.json: ${error.message}`);
    process.exit(1);
  }

  // Generate and write TS XML file with sorted messages
  const tsXml = generateTsXml(newTranslations, existingTranslations);
  fs.writeFileSync(
    path.join(ROOT_DIR, OUTPUT_FILE),
    tsXml
  );

  // Get final message count
  const finalCount = await countMessagesInFile(path.join(ROOT_DIR, OUTPUT_FILE));
  console.log(`\nOld message count in ${OUTPUT_FILE}: ${initialCount}`);
  console.log(`New message count in ${OUTPUT_FILE}: ${finalCount}`);

  // Calculate difference
  const difference = finalCount - initialCount;
  if (difference > 0) {
    console.log(`Added ${difference} new messages`);
  } else if (difference < 0) {
    console.log(`Removed ${Math.abs(difference)} messages`);
  } else {
    console.log(`No change in total message count`);
  }

}

extractTranslations().catch(console.error);
