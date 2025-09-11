#!/usr/bin/env tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { readFile, writeFile } from "fs/promises";
import yargs from "yargs/yargs";

// ==============================
// === Read and validate args ===
// ==============================

const args = yargs(process.argv)
  .options({
    english: {
      description: "English JSON path (optional, for English translations)",
      type: "string",
    },
    in: {
      demandOption: true,
      description: "Strings JSON path to convert",
      type: "string",
    },
    out: {
      demandOption: true,
      description: "Output path of generated CSV file",
      type: "string",
    },
    schema: {
      description: "Schema JSON path (optional, for descriptions)",
      type: "string",
    },
  })
  .epilogue(
    'Example: npm run -- convert-strings-json-to-csv --in=src/strings/stringsFa.json --out=src/strings/stringsFa.csv --schema=src/strings/strings.schema.json --english=src/strings/stringsEn.json\n\nMake sure you prepend arguments with "--"! See https://docs.npmjs.com/cli/v9/commands/npm-run-script#description',
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
const readFileAndParse = async (filePath: string): Promise<unknown> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  return JSON.parse(await readFile(filePath, "utf-8"));
};

// =================
// === Functions ===
// =================

/**
 * Converts the nested keys to flat dot-separated keys (sets $description keys).
 */
function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null;
}

const flattenObject = (
  obj: Record<string, unknown>,
  prefix = "",
): Record<string, string> =>
  Object.keys(obj).reduce((acc: Record<string, string>, key: string) => {
    const newPrefix = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    if (isObject(value)) {
      const desc =
        typeof value.$description === "string" ? value.$description : "";
      return {
        ...acc,
        [newPrefix]: desc,
        ...flattenObject(value, newPrefix),
      };
    } else {
      return { ...acc, [newPrefix]: String(value) };
    }
  }, {});

/**
 * Function checks description value for newlines and replaces (\n\n) with single space
 * also replaces undefined values with empty string
 *
 * @param description {string | undefined}
 */
const normalizeDescription = (description: string | undefined): string =>
  description !== undefined ? description.replace(/\n+/g, " ").trim() : "";

/**
 * Function loops through nested objects,
 * creates new object that holds keys and description
 * description values are passed to descriptionCheck
 */
const parseProperties = (
  outerValue: Record<string, unknown>,
  outerKeyObj: Record<string, unknown>,
): void => {
  for (const innerKey in outerValue) {
    const innerValue = outerValue[innerKey];
    let description = "";
    if (isObject(innerValue) && typeof innerValue.description === "string") {
      description = normalizeDescription(innerValue.description) || "";
    }
    // eslint-disable-next-line no-param-reassign
    outerKeyObj[innerKey] = {
      $description: description,
    };
    if (isObject(innerValue) && isObject(innerValue.properties)) {
      parseProperties(
        innerValue.properties,
        outerKeyObj[innerKey] as Record<string, unknown>,
      );
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
  schemaJson: unknown,
): Record<string, unknown> => {
  if (!isObject(schemaJson)) return {};
  const stringsSchemaJson: Record<string, unknown> = {};
  const definitions = schemaJson.definitions;
  if (!isObject(definitions)) return {};
  const stringsDef = definitions.Strings;
  if (!isObject(stringsDef) || !isObject(stringsDef.properties)) return {};
  const topLevelStringsKeys = Object.keys(
    (stringsDef as Record<string, any>).properties,
  );
  topLevelStringsKeys.forEach((topLevelStringsKey) => {
    if (topLevelStringsKey === "$schema") {
      return;
    }
    const topLevelStringTypeName =
      topLevelStringsKey.charAt(0).toUpperCase() +
      topLevelStringsKey.slice(1) +
      "Strings";
    const outerValue = isObject(definitions[topLevelStringTypeName])
      ? definitions[topLevelStringTypeName]
      : undefined;
    if (outerValue && isObject(outerValue.properties)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const outerKeyProperty = isObject(stringsDef.properties)
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          (stringsDef as Record<string, any>).properties[topLevelStringsKey]
        : undefined;
      let description = "";
      if (
        isObject(outerKeyProperty) &&
        typeof outerKeyProperty.description === "string"
      ) {
        description = normalizeDescription(outerKeyProperty.description);
      }
      stringsSchemaJson[topLevelStringsKey] = {
        $description: description,
      };
      parseProperties(
        (outerValue as Record<string, any>).properties,
        stringsSchemaJson[topLevelStringsKey] as Record<string, unknown>,
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
  nestedStringsObjectDescriptions: Record<string, unknown>,
  englishJson: Record<string, unknown>,
  localeJson: Record<string, unknown>,
): Record<string, string> => {
  const csvValuesByKey: Record<string, string> = {};
  const flatEnJson = flattenObject(englishJson);
  const flatLocaleJson = flattenObject(localeJson);
  const flatNestedStringsObjectDescriptions = flattenObject(
    nestedStringsObjectDescriptions,
  );
  for (const key in flatLocaleJson) {
    if (key === "$schema") {
      continue;
    }
    csvValuesByKey[key] = [
      flatEnJson[key] || "---",
      flatLocaleJson[key] || "---",
      flatNestedStringsObjectDescriptions[key] || "",
    ]
      .map((segment: string) => `"${segment.replaceAll('"', '""')}"`)
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
const recursivelySortObjectByKeys = (
  object: Record<string, unknown>,
): Record<string, unknown> => {
  const sortedKeys = [...Object.keys(object)].sort((key1, key2) =>
    key1.toUpperCase() < key2.toUpperCase()
      ? -1
      : key1.toUpperCase() > key2.toUpperCase()
        ? 1
        : 0,
  );
  const sortedObject = sortedKeys.reduce(
    (acc: Record<string, unknown>, key: string) => ({
      ...acc,
      [key]: isObject(object[key])
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
const jsonToCsv = (obj: Record<string, string>): string => {
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
  // Read the main locale file
  const localeJsonRaw = await readFileAndParse(args.in);
  const localeJson = isObject(localeJsonRaw) ? localeJsonRaw : {};

  // Read optional schema file if provided
  let schemaJson = {};
  if (args.schema) {
    const schemaJsonRaw = await readFileAndParse(args.schema);
    schemaJson = isObject(schemaJsonRaw) ? schemaJsonRaw : {};
  }

  // Read optional English file if provided
  let englishJson = {};
  if (args.english) {
    const englishJsonRaw = await readFileAndParse(args.english);
    englishJson = isObject(englishJsonRaw) ? englishJsonRaw : {};
  }

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

  // Convert sorted object to Record<string, string> for jsonToCsv
  const sortedCsvValues: Record<string, string> = {};
  const sorted = recursivelySortObjectByKeys(csvValuesByKey);
  Object.keys(sorted).forEach((key) => {
    const val = sorted[key];
    sortedCsvValues[key] = typeof val === "string" ? val : String(val);
  });
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await writeFile(args.out, jsonToCsv(sortedCsvValues), "utf-8");
};

void convertStringsJsonToCsv();
