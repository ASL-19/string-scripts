#!/usr/bin/env tsx
import { readFile, writeFile } from "fs/promises";
import lodashMerge from "lodash/merge.js";
import prettier from "prettier";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

// ==============================
// === Read and validate args ===
// ==============================
const args = yargs(hideBin(process.argv))
  .options({
    english: {
      demandOption: true,
      description: "Path to English JSON file to use as base for syncing",
      type: "string",
    },
    files: {
      demandOption: true,
      description: "Comma-separated list of JSON file paths to sync and sort",
      type: "string",
    },
  })
  .epilogue(
    'Example: npm run -- sync-strings --files=src/strings/stringsFa.json,src/strings/stringsAr.json --english=src/strings/stringsEn.json\n\nMake sure you prepend arguments with "--"! See https://docs.npmjs.com/cli/v9/commands/npm-run-script#description',
  )
  .parseSync();

if (!args.english.endsWith(".json")) {
  console.error("--english argument must be a JSON path");
  process.exit(1);
}

const filePaths = args.files.split(",").map((path) => path.trim());
for (const filePath of filePaths) {
  if (!filePath.endsWith(".json")) {
    console.error(`File path "${filePath}" must be a JSON path`);
    process.exit(1);
  }
}

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
 * Read and parse a JSON file.
 *
 * @param filePath - Path to the JSON file
 * @returns Parsed JSON object
 */
const readJsonFile = async (
  filePath: string,
): Promise<Record<string, unknown>> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, security/detect-non-literal-fs-filename
  return JSON.parse(await readFile(filePath, "utf-8"));
};

/**
 * Sync new strings from English strings file to provided locale's strings file;
 * sort strings by key.
 */
const syncAndSortLocaleStrings = async ({
  englishStrings,
  filePath,
  prettierOptions,
}: {
  englishStrings: Record<string, unknown>;
  filePath: string;
  prettierOptions: import("prettier").Options;
}) => {
  try {
    const localeStrings = await readJsonFile(filePath);

    const mergedAndSortedStrings = recursivelySortObjectByKeys(
      lodashMerge(englishStrings, localeStrings),
    );

    const newStringValue = await prettier.format(
      JSON.stringify(mergedAndSortedStrings),
      {
        ...prettierOptions,
        filepath: filePath,
      },
    );

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await writeFile(filePath, newStringValue, "utf-8");

    // eslint-disable-next-line no-console
    console.log(`Successfully synced and sorted: ${filePath}`);
  } catch (error) {
    console.warn(
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      `Not writing ${filePath} strings since an error occurred while merging its strings: ${error}`,
    );
  }
};

// ================================================
// === Sync and sort each provided file's strings ===
// ================================================

const syncAndSortStrings = async () => {
  try {
    // Read the English strings file
    const englishStrings = await readJsonFile(args.english);

    /**
     * Prettier config for JSON files (resolved from English strings file).
     */
    const prettierOptions = (await prettier.resolveConfig(args.english)) ?? {};

    // Process each provided file
    const promises = filePaths.map((filePath) =>
      syncAndSortLocaleStrings({
        englishStrings,
        filePath,
        prettierOptions,
      }),
    );

    await Promise.all(promises);

    // eslint-disable-next-line no-console
    console.log(`Successfully processed ${filePaths.length} file(s)`);
  } catch (error) {
    console.error(
      `Error processing files: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(1);
  }
};

void syncAndSortStrings();
