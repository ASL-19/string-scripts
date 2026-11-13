import getFlatEntries from "./getFlatEntries.js";
import getSchemaDescriptionsByFlatKey from "./getSchemaDescriptionsByFlatKey.js";

/**
 * Escape CSV field value (wrap in quotes, escape '"' as '""').
 */
const csvField = (value: string) => `"${value.replaceAll('"', '""')}"`;

/**
 * Get a strings object value’s “Source” or “Translation” cell ("---" for
 * non-leaf nodes and missing, empty or non-string values).
 */
const getStringCell = (value: unknown) =>
  typeof value === "string" && value !== "" ? value : "---";

/**
 * Compare strings case-insensitively.
 */
const compareCaseInsensitive = (string1: string, string2: string) => {
  const upperCaseString1 = string1.toUpperCase();
  const upperCaseString2 = string2.toUpperCase();

  return upperCaseString1 < upperCaseString2
    ? -1
    : upperCaseString1 > upperCaseString2
      ? 1
      : 0;
};

/**
 * Convert strings objects to CSV text content with columns "Key", "Source",
 * "Translation", and "Description".
 *
 * Rows are sorted by key (case-insensitive). Non-leaf nodes and missing
 * values have their Source and Translation set to "---".
 *
 * @public
 */
const stringsJsonToCsv = ({
  localeStrings,
  schemaJson,
  sourceStrings,
}: {
  /** Strings to translate, used for the “Translation” column */
  localeStrings: Record<string, unknown>;
  /** Strings JSON Schema, used for the “Description” column */
  schemaJson: unknown;
  /** Source (usually English) strings, used for the “Source” column */
  sourceStrings: Record<string, unknown>;
}): string => {
  const sourceValuesByFlatKey = new Map(getFlatEntries(sourceStrings));
  const descriptionsByFlatKey = getSchemaDescriptionsByFlatKey(schemaJson);

  const rows = getFlatEntries(localeStrings)
    .filter(([flatKey]) => flatKey !== "$schema")
    .sort(([flatKey1], [flatKey2]) =>
      compareCaseInsensitive(flatKey1, flatKey2),
    )
    .map(([flatKey, value]) =>
      [
        flatKey,
        getStringCell(sourceValuesByFlatKey.get(flatKey)),
        getStringCell(value),
        descriptionsByFlatKey.get(flatKey) ?? "",
      ]
        .map(csvField)
        .join(","),
    );

  return ['"Key","Source","Translation","Description"', ...rows].join("\n");
};

export default stringsJsonToCsv;
