// This script fixes the translation files that are not en_US.
// It uses en_US as the base and only keeps the neccessary translations.
// Problems fixed by this script include duplicate messages, multiple context tags, deprecated messages, and missing translations.

const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const { parseString } = xml2js;

const ROOT_DIR = path.join(__dirname, '..');
const LOCALE_DIR = path.join(ROOT_DIR, 'locale');
const REFERENCE_LANG = 'en_US';

function escapeXml(text) {
  if (text === null || text === undefined) return '';
  if (typeof text !== 'string') {
    if (text._) { // Handle xml2js parsed objects with _ property
      return escapeXml(text._);
    }
    console.warn('Non-string value passed to escapeXml:', text);
    return '';
  }
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function cleanTranslations() {
  try {
    // 1. Load and parse reference file
    const referencePath = path.join(LOCALE_DIR, REFERENCE_LANG, 'translations.ts');
    if (!fs.existsSync(referencePath)) {
      throw new Error(`Reference file not found at ${referencePath}`);
    }

    console.log(`Loading reference file from ${referencePath}`);
    const referenceXml = fs.readFileSync(referencePath, 'utf-8');
    const referenceData = await parseXml(referenceXml);

    // 2. Extract all valid source strings
    const validSources = new Set();
    let totalMessages = 0;

    if (!referenceData?.TS?.context) {
      throw new Error('Invalid reference file structure - missing TS.context');
    }

    const contexts = Array.isArray(referenceData.TS.context)
      ? referenceData.TS.context
      : [referenceData.TS.context];

    contexts.forEach(context => {
      if (!context.message) return;

      const messages = Array.isArray(context.message)
        ? context.message
        : [context.message];

      messages.forEach(message => {
        totalMessages++;
        if (message?.source?.[0] && typeof message.source[0] === 'string') {
          const sourceText = message.source[0].trim();
          if (sourceText) {
            validSources.add(sourceText);
          }
        }
      });
    });

    console.log(`Found ${totalMessages} messages in reference, ${validSources.size} valid source strings`);

    // 3. Process all translation files
    const langFolders = fs.readdirSync(LOCALE_DIR).filter(folder => {
      return folder !== REFERENCE_LANG &&
        fs.statSync(path.join(LOCALE_DIR, folder)).isDirectory();
    });

    for (const langFolder of langFolders) {
      console.log(`Processing ${langFolder}...`);
      const translationPath = path.join(LOCALE_DIR, langFolder, 'translations.ts');

      if (!fs.existsSync(translationPath)) {
        console.log(`File not found, skipping ${langFolder}`);
        continue;
      }

      // 4. Parse translation file
      const translationXml = fs.readFileSync(translationPath, 'utf-8');
      let translationData;

      try {
        translationData = await parseXml(translationXml);
      } catch (err) {
        console.error(`Error parsing ${langFolder}/translations.ts:`, err.message);
        continue;
      }

      // 5. Collect valid messages with proper type checking
      const validMessages = [];
      const seenSources = new Set();
      let processedMessages = 0;

      if (translationData?.TS?.context) {
        const contexts = Array.isArray(translationData.TS.context)
          ? translationData.TS.context
          : [translationData.TS.context];

        contexts.forEach(context => {
          if (!context.message) return;

          const messages = Array.isArray(context.message)
            ? context.message
            : [context.message];

          messages.forEach(message => {
            processedMessages++;
            if (message?.source?.[0] && typeof message.source[0] === 'string') {
              const sourceText = message.source[0].trim();
              if (sourceText && validSources.has(sourceText)) {
                if (!seenSources.has(sourceText)) {
                  seenSources.add(sourceText);
                  // Handle translation (including unfinished ones)
                  let translation = '';
                  if (message.translation) {
                    if (Array.isArray(message.translation)) {
                      translation = message.translation[0]?._ || message.translation[0] || '';
                    } else if (typeof message.translation === 'object') {
                      translation = message.translation._ || '';
                    } else {
                      translation = message.translation;
                    }
                  }
                  // Handle extracomment
                  let extracomment = '';
                  if (message.extracomment) {
                    if (Array.isArray(message.extracomment)) {
                      extracomment = message.extracomment[0]?._ || message.extracomment[0] || '';
                    } else if (typeof message.extracomment === 'object') {
                      extracomment = message.extracomment._ || '';
                    } else {
                      extracomment = message.extracomment;
                    }
                  }
                  // Build clean message
                  const cleanMessage = {
                    source: [sourceText],
                    translation: [translation],
                  };
                  if (extracomment) {
                    cleanMessage.extracomment = [extracomment];
                  }
                  validMessages.push(cleanMessage);
                }
              }
            }
          });
        });
      }

      console.log(`Processed ${processedMessages} messages, keeping ${validMessages.length} valid messages`);

      // 6. Generate clean XML output with robust escaping
      const newXml = buildCleanXml({
        version: translationData?.TS?.$?.version || '2.0',
        language: langFolder,
        sourcelanguage: translationData?.TS?.$?.sourcelanguage || 'en_US',
        defaultcodec: translationData?.TS?.defaultcodec || 'UTF-8',
        messages: validMessages
      });

      fs.writeFileSync(translationPath, newXml);
      console.log(`Updated ${langFolder}/translations.ts`);
    }

    console.log('Translation cleanup complete!');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

function buildCleanXml({ version, language, sourcelanguage, defaultcodec, messages }) {
  const messagesXml = messages.map(msg => {
    const source = escapeXml(msg.source[0] || '');
    const translation = escapeXml(msg.translation?.[0] || '');
    const extracomment = msg.extracomment?.[0] ?
      `\n      <extracomment>${escapeXml(msg.extracomment[0])}</extracomment>` : '';
    return `    <message>
      <source>${source}</source>
      <translation>${translation}</translation>${extracomment}
    </message>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE TS>
<TS version="${version}" language="${language}" sourcelanguage="${sourcelanguage}">
  <defaultcodec>${defaultcodec}</defaultcodec>
  <context>
    <name>default</name>
${messagesXml}
  </context>
</TS>`;
}

function parseXml(xml) {
  return new Promise((resolve, reject) => {
    parseString(xml, {
      explicitArray: true,
      preserveChildrenOrder: true,
      trim: false,
      explicitRoot: true,
      explicitChildren: true,
      emptyTag: null,
      strict: true,
      normalize: false,
      normalizeTags: false,
      attrkey: '$',
      charkey: '_'
    }, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

cleanTranslations();