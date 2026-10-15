/**
 * Nested strings object, as stored in a strings JSON file (e.g.
 * `stringsEn.json`).
 *
 * @public
 */
export type StringsObject = { [key: string]: string | StringsObject };
