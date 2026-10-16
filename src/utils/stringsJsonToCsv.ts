import flattenObject from "./flattenObject.js";
import getNestedStringsObjectDescriptions from "./getNestedStringsObjectDescriptions.js";

/**
 * Escape CSV field value (wrap in quotes, escape '"' as '""').
 */
const csvField = (value: string) => `"${value.replaceAll('"', '""')}"`;

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
  const flatSourceStrings = flattenObject(sourceStrings);
  const flatLocaleStrings = flattenObject(localeStrings);
  const flatDescriptions = flattenObject(
    getNestedStringsObjectDescriptions(schemaJson),
  );

  const rows = Object.keys(flatLocaleStrings)
    .filter((key) => key !== "$schema")
    .sort((key1, key2) =>
      key1.toUpperCase() < key2.toUpperCase()
        ? -1
        : key1.toUpperCase() > key2.toUpperCase()
          ? 1
          : 0,
    )
    .map((key) =>
      [
        key,
        flatSourceStrings[key] || "---",
        flatLocaleStrings[key] || "---",
        flatDescriptions[key] || "",
      ]
        .map(csvField)
        .join(","),
    );

  return ['"Key","Source","Translation","Description"', ...rows].join("\n");
};

export default stringsJsonToCsv;
