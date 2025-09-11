#!/usr/bin/env tsx
import { readFile, writeFile } from "fs/promises";
import lodashMerge from "lodash/merge.js";
import prettier from "prettier";

// =============
// === Types ===
// =============

/**
 * @typedef {import("src/values/localeValues").LocaleCode} LocaleCode
 * @typedef {typeof import("src/values/localeValues").localeCodes} LocaleCodes
 * @typedef {import("src/types/stringTypes").Strings} Strings
 */

// =============
// === Utils ===
// =============

/**
 * Recursively sort object by keys
 *
 * Modernized and simplified version of:
 * http://whitfin.io/sorting-object-recursively-node-jsjavascript/
 */
function recursivelySortObjectByKeys(
  object: Record<string, unknown>,
): Record<string, unknown> {
  const sortedKeys = [...Object.keys(object)].sort((key1, key2) =>
    key1 < key2 ? -1 : key1 > key2 ? 1 : 0,
  );
  const sortedObject = sortedKeys.reduce(
    (acc: Record<string, unknown>, key: string) => ({
      ...acc,
      [key]:
        typeof object[key] === "object" && object[key] !== null
          ? recursivelySortObjectByKeys(object[key] as Record<string, unknown>)
          : object[key],
    }),
    {},
  );
  return sortedObject;
}

/**
 * Get the provided locale’s strings file path.
 *
 * @param {LocaleCode} localeCode
 * @returns string
 */
const localeCodeToStringsPath = (localeCode: Array<string>): string =>
  `src/strings/strings${/** @type {string} */ localeCode[0].toUpperCase()}${
    localeCode[1]
  }.json`;

/**
 * Get the provided locale’s strings.
 *
 * @param {LocaleCode} localeCode
 * @returns Strings
 */
const localeCodeToStrings = async (
  localeCode: Array<string>,
): Promise<Record<string, unknown>> =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, security/detect-non-literal-fs-filename
  JSON.parse(await readFile(localeCodeToStringsPath(localeCode), "utf-8"));

/**
 * Sync new strings from English strings file to provided locale’s strings file;
 * sort strings by key.
 */
const syncAndSortLocaleStrings = async (
  /**
   * @type {{
   *  localeCode: LocaleCode;
   *  prettierOptions: import("prettier").Options;
   * }}
   */
  {
    localeCode,
    prettierOptions,
  }: { localeCode: Array<string>; prettierOptions: import("prettier").Options },
) => {
  try {
    const [enStrings, localeStrings] = await Promise.all([
      localeCodeToStrings(["en"]),
      localeCodeToStrings(localeCode),
    ]);

    const mergedAndSortedStrings = recursivelySortObjectByKeys(
      lodashMerge(enStrings, localeStrings),
    );

    const newStringValue = await prettier.format(
      JSON.stringify(mergedAndSortedStrings),
      {
        ...prettierOptions,
        filepath: localeCodeToStringsPath(localeCode),
      },
    );

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await writeFile(
      localeCodeToStringsPath(localeCode),
      newStringValue,
      "utf-8",
    );
  } catch {
    console.warn(
      `Not writing ${localeCode.join(",")} strings since an error occurred while merging its strings!`,
    );
  }
};

// ==============
// === Values ===
// ==============

/**
 * @type {LocaleCodes}
 */
const localeCodes: Array<string> = ["en", "fa"];

// ================================================
// === Sync and sort each locale code’s strings ===
// ================================================

const syncAndSortStrings = async () => {
  /**
   * Prettier config for JSON files (resolved from English strings file).
   */
  const prettierOptions =
    (await prettier.resolveConfig(localeCodeToStringsPath(["en"]))) ?? {};

  // Note: We process the English strings file (despite it not needing to
  // synchronize with itself) since it’s still useful for it to be auto-formatted
  // with Prettier
  localeCodes.forEach((localeCode) => {
    void syncAndSortLocaleStrings({
      localeCode: [localeCode],
      prettierOptions,
    });
  });
};

void syncAndSortStrings();
