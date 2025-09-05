import { parse as csvParseSync } from "csv-parse/sync";
import { readFile, writeFile } from "fs/promises";
import lodashFpMerge from "lodash/fp/merge";
import prettier from "prettier";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

// ==============================
// === Read and validate args ===
// ==============================
const args = yargs(hideBin(process.argv))
  .options({
    in: {
      demandOption: true,
      description: "CSV file path to convert (src/strings/strings*.csv)",
      type: "string",
    },
    out: {
      demandOption: true,
      description: "Output path of generated Strings JSON",
      type: "string",
    },
  })
  .epilogue(
    'Example: npm run -- convert-strings-csv-to-json --in=src/strings/stringsFa.csv --out=src/strings/stringsFa.json\n\nMake sure you prepend arguments with "--"! See https://docs.npmjs.com/cli/v9/commands/npm-run-script#description',
  )
  .parseSync();

if (!args.in.endsWith(".csv")) {
  console.error("--in argument must be a CSV path");
  process.exit(1);
}

if (!args.out.endsWith(".json")) {
  console.error("--out argument must be a JSON path");
  process.exit(1);
}

// =================
// === Functions ===
// =================

/**
 * Convert CSV file text content to object of values by flat key.
 *
 * @returns {{ [flatKey: string]: string }}
 */
const stringsCsvToValuesByFlatKeys = (
  /** @type {string} */ stringsCsvTextContent,
) => {
  /** @type {Array<Array<string>>} */
  const [parsedHeaderLine, ...parsedStringLines] = csvParseSync(
    stringsCsvTextContent,
    { trim: true },
  );

  if (!parsedHeaderLine) {
    console.error("Provided CSV is malformed (empty?)");
    process.exit(1);
  }

  const keyIndex = parsedHeaderLine.indexOf("Key");
  const translationIndex = parsedHeaderLine.indexOf("Translation");

  const valuesByFlatKeys = parsedStringLines.reduce((acc, parsedStringLine) => {
    /* eslint-disable security/detect-object-injection */
    const keySegment = parsedStringLine[keyIndex];
    const valueSegment = parsedStringLine[translationIndex];
    /* eslint-enable */

    if (!keySegment || typeof valueSegment !== "string") {
      console.error("Provided CSV line is malformed:", parsedStringLine);
      process.exit(1);
    }

    const key = keySegment.replaceAll('"', "").trim();
    const value = valueSegment.replaceAll('"', "").trim();

    // We filter out "---" values so the returned object is only leaf nodes.
    return value === "---" ? acc : { ...acc, [key]: value };
  }, {});

  return valuesByFlatKeys;
};

/**
 * Convert flat dot-separated keys to nested object.
 *
 * @param valuesByFlatKeys {Record<string, string>}
 */
const valuesByFlatKeysToNestedObject = (valuesByFlatKeys) =>
  Object.entries(valuesByFlatKeys).reduce((acc, [flatKey, value]) => {
    const flatKeySegments = flatKey.split(".");

    /**
     * Given flatKeySegments ["a", "b", "c"] and value "foo" produces:
     *
     * { a: { b: { c: "foo" } } }
     */
    const valueObject = flatKeySegments.reduceRight(
      // @ts-expect-error (value can be string or Record<string, string> so
      // can't be typed accurately?)
      (acc, elem) => ({ [elem]: acc }),
      value,
    );

    return lodashFpMerge(acc, valueObject);
  }, {});

// ==================
// === Main logic ===
// ==================

const convertStringsCsvToJson = async () => {
  /** @type {import("../types/stringTypes").Strings} */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const currentLocaleStrings = JSON.parse(await readFile(args.out, "utf-8"));

  const stringsCsvTextContent = await readFile(args.in, "utf-8");

  const valuesByFlatKeys = stringsCsvToValuesByFlatKeys(stringsCsvTextContent);

  const newLocaleStrings = valuesByFlatKeysToNestedObject(valuesByFlatKeys);

  const mergedStrings = lodashFpMerge(currentLocaleStrings, newLocaleStrings);

  const outPrettierConfig = (await prettier.resolveConfig(args.out)) ?? {};

  const formattedStringsJsonText = await prettier.format(
    JSON.stringify(mergedStrings),
    {
      ...outPrettierConfig,
      filepath: args.out,
    },
  );

  await writeFile(args.out, formattedStringsJsonText, "utf-8");
};

void convertStringsCsvToJson();
