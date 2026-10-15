import { parse as csvParseSync } from "csv-parse/sync";

/**
 * Convert strings CSV text content to object of translations by flat
 * dot-separated key.
 *
 * The CSV must have a header row containing "Key" and "Translation" columns.
 * Rows with a translation of "---" (non-leaf nodes and untranslated strings)
 * are omitted.
 */
const stringsCsvToValuesByFlatKeys = (
  stringsCsvTextContent: string,
): Record<string, string> => {
  const [parsedHeaderLine, ...parsedStringLines] = csvParseSync(
    stringsCsvTextContent,
    {
      trim: true,
    },
  );

  if (!parsedHeaderLine) {
    throw new Error("Provided CSV is malformed (empty?)");
  }

  const keyIndex = parsedHeaderLine.indexOf("Key");
  const translationIndex = parsedHeaderLine.indexOf("Translation");

  if (keyIndex === -1 || translationIndex === -1) {
    throw new Error(
      'Provided CSV header must contain "Key" and "Translation" columns',
    );
  }

  return parsedStringLines.reduce<Record<string, string>>(
    (acc, parsedStringLine) => {
      // csv-parse’s trim option doesn’t trim whitespace inside quotes
      const key = parsedStringLine[keyIndex]?.trim();
      const value = parsedStringLine[translationIndex]?.trim();

      if (!key || typeof value !== "string") {
        throw new Error(
          `Provided CSV line is malformed: ${JSON.stringify(parsedStringLine)}`,
        );
      }

      // We filter out "---" values so the returned object is only leaf nodes.
      return value === "---" ? acc : { ...acc, [key]: value };
    },
    {},
  );
};

export default stringsCsvToValuesByFlatKeys;
