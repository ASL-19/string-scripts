/**
 * Utilities for converting strings JSON files to/from CSV (for translation)
 * and syncing strings JSON files.
 *
 * The CLI scripts (`convertStringsCsvToJson`, `convertStringsJsonToCsv`, and
 * `syncAndSortStrings`) are thin wrappers around these functions.
 *
 * @packageDocumentation
 */

export type { StringsObject } from "./types/StringsObject.js";
export { default as mergeStringsCsvIntoStrings } from "./utils/mergeStringsCsvIntoStrings.js";
export { default as stringsJsonToCsv } from "./utils/stringsJsonToCsv.js";
export { default as syncAndSortLocaleStrings } from "./utils/syncAndSortLocaleStrings.js";
