/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { readFile, writeFile } from "fs/promises";
import yargs from "yargs/yargs";

// ==============================
// === Read and validate args ===
// ==============================

const args = yargs(process.argv)
  .options({
    in: {
      demandOption: true,
      description: "Strings JSON path to convert (src/strings/strings*.json)",
      type: "string",
    },
    out: {
      demandOption: true,
      description: "Output path of generated CSV file",
      type: "string",
    },
  })
  .epilogue(
    'Example: npm run -- convert-strings-json-to-csv --in=src/strings/stringsFa.json --out=src/strings/stringsFa.csv\n\nMake sure you prepend arguments with "--"! See https://docs.npmjs.com/cli/v9/commands/npm-run-script#description',
  )
  .parseSync();

if (!args.in.endsWith(".json")) {
  console.error("--in argument must be a JSON path");
  process.exit(1);
}

if (!args.out.endsWith(".csv")) {
  console.error("--out argument must be a CSV path");
  process.exit(1);
}

/**
 * Get file content and convert to JS object
 */
const readFileAndParse = async (/** @type {string} */ filePath) =>
  JSON.parse(await readFile(filePath, "utf-8"));

// =================
// === Functions ===
// =================

/**
 * Converts the nested keys to flat dot-separated keys (sets $description keys).
 */
const flattenObject = (obj, prefix = "") =>
  Object.keys(obj).reduce((acc, key) => {
    const newPrefix = prefix ? `${prefix}.${key}` : key;

    return typeof obj[key] === "object" && obj[key] !== null
      ? {
          ...acc,
          [newPrefix]: obj[key].$description || "",
          ...flattenObject(obj[key], newPrefix),
        }
      : { ...acc, [newPrefix]: obj[key] };
  }, {});

/**
 * Function checks description value for newlines and replaces (\n\n) with single space
 * also replaces undefined values with empty string
 *
 * @param description {string | undefined}
 */
const normalizeDescription = (description) =>
  description !== undefined ? description.replace(/\n+/g, " ").trim() : "";

/**
 * Function loops through nested objects,
 * creates new object that holds keys and description
 * description values are passed to descriptionCheck
 */
const parseProperties = (outerValue, outerKeyObj) => {
  for (const innerKey in outerValue) {
    const innerValue = outerValue[innerKey];

    // eslint-disable-next-line no-param-reassign
    outerKeyObj[innerKey] = {
      $description: normalizeDescription(innerValue.description) || "",
    };

    if (innerValue.properties) {
      parseProperties(innerValue.properties, outerKeyObj[innerKey]);
    }
  }
};

/**
 * Given the content of strings.schema.json returns an object of its nested
 * properties with $description keys containing the string’s docstring
 * description.
 *
 * @returns {Object} Object in the form:
 *
 * ```js
 * {
 *   TopLevelKey1: {
 *     $description: "TopLevelKey1 description",
 *     nestedKey1: {
 *       $description: "nestedKey1 description"
 *       deeplyNestedKey1: {
 *         $description: "deeplyNestedKey1 description"
 *       }
 *     }
 *     nestedKey2: {
 *       $description: "nestedKey2 description"
 *     }
 *   }
 * }
 * ```
 */
const getNestedStringsObjectDescriptions = (
  /** @type {Object} */ schemaJson,
) => {
  const stringsSchemaJson = {};

  const topLevelStringsKeys = Object.keys(
    schemaJson.definitions.Strings.properties,
  );

  topLevelStringsKeys.forEach((topLevelStringsKey) => {
    if (topLevelStringsKey === "$schema") {
      return;
    }

    const topLevelStringTypeName =
      topLevelStringsKey.charAt(0).toUpperCase() +
      topLevelStringsKey.slice(1) +
      "Strings";

    const outerValue = schemaJson.definitions[topLevelStringTypeName];

    if (outerValue.properties) {
      const outerKeyProperty =
        schemaJson.definitions.Strings.properties[topLevelStringsKey];

      stringsSchemaJson[topLevelStringsKey] = {
        $description: normalizeDescription(
          outerKeyProperty ? outerKeyProperty.description : "",
        ),
      };

      parseProperties(
        outerValue.properties,
        stringsSchemaJson[topLevelStringsKey],
      );
    }
  });

  return stringsSchemaJson;
};

/**
 * Generate CSV values by Strings type key.
 *
 * @returns {Object} Object with values by Strings type key. Values are in the
 * form: `"${English}","${Translation}","${Description}"`.
 *
 * @remarks Non-leaf node keys will have values set to "---".
 */
const generateCsvValuesByKey = (
  /** @type {Object} */ nestedStringsObjectDescriptions,
  /** @type {Object} */ englishJson,
  /** @type {Object} */ localeJson,
) => {
  const csvValuesByKey = {};

  const flatEnJson = flattenObject(englishJson);
  const flatLocaleJson = flattenObject(localeJson);
  const flatNestedStringsObjectDescriptions = flattenObject(
    nestedStringsObjectDescriptions,
  );

  // Checks matched keys with English and nonEnglish descriptions
  // if keys are matched get description value from strings.schema.strings
  for (const key in flatLocaleJson) {
    if (key === "$schema") {
      continue;
    }

    csvValuesByKey[key] = [
      flatEnJson[key] || "---",
      flatLocaleJson[key] || "---",
      flatNestedStringsObjectDescriptions[key] || "",
    ]
      .map(
        // In CSV files '"' is escaped as '""'
        (/** @type string */ segment) => `"${segment.replaceAll('"', '""')}"`,
      )
      .join(",");
  }

  return csvValuesByKey;
};

/**
 * Recursively sort object by keys
 *
 * Modernized and simplified version of:
 * http://whitfin.io/sorting-object-recursively-node-jsjavascript/
 */
const recursivelySortObjectByKeys = (/** @type Object */ object) => {
  const sortedKeys = [...Object.keys(object)].sort((key1, key2) =>
    key1.toUpperCase() < key2.toUpperCase()
      ? -1
      : key1.toUpperCase() > key2.toUpperCase()
        ? 1
        : 0,
  );

  const sortedObject = sortedKeys.reduce(
    (acc, key) => ({
      ...acc,
      [key]:
        typeof object[key] === "object"
          ? recursivelySortObjectByKeys(object[key])
          : object[key],
    }),
    {},
  );

  return sortedObject;
};

/**
 * Function converts json to csv
 */
const jsonToCsv = (obj) => {
  const headerRow = '"Key","English","Translation","Description"';
  const csv = [headerRow]
    .concat(Object.keys(obj).map((key) => `"${key}",${obj[key]}`))
    .join("\n");

  return csv;
};

// ==================
// === Main logic ===
// ==================

const convertStringsJsonToCsv = async () => {
  const [schemaJson, englishJson, localeJson] = await Promise.all([
    readFileAndParse("src/strings/strings.schema.json"),
    readFileAndParse("src/strings/stringsEn.json"),
    readFileAndParse(args.in),
  ]);

  const nestedStringsObjectDescriptions =
    getNestedStringsObjectDescriptions(schemaJson);

  const csvValuesByKey = generateCsvValuesByKey(
    nestedStringsObjectDescriptions,
    englishJson,
    localeJson,
  );

  /**
   * Create CSV file
   */
  await writeFile(
    args.out,
    jsonToCsv(recursivelySortObjectByKeys(csvValuesByKey)),
    "utf-8",
  );
};

void convertStringsJsonToCsv();
