#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import syncAndSortLocaleStrings from "../utils/syncAndSortLocaleStrings.js";
import assertPathExtension from "./utils/assertPathExtension.js";
import getCliEpilogue from "./utils/getCliEpilogue.js";
import readJsonObjectFile from "./utils/readJsonObjectFile.js";
import runCli from "./utils/runCli.js";
import writePrettierJsonFile from "./utils/writePrettierJsonFile.js";

const args = yargs(hideBin(process.argv))
  .options({
    files: {
      demandOption: true,
      description:
        "Comma-separated list of strings JSON paths to sync and sort (can include the source path to sort it)",
      type: "string",
    },
    source: {
      demandOption: true,
      description:
        "Source (usually English) strings JSON path to sync missing strings from",
      type: "string",
    },
  })
  .strict()
  .epilogue(
    getCliEpilogue(
      "syncAndSortStrings --source=src/strings/stringsEn.json --files=src/strings/stringsEn.json,src/strings/stringsFa.json",
    ),
  )
  .parseSync();

const filePaths = args.files
  .split(",")
  .map((path) => path.trim())
  .filter(Boolean);

assertPathExtension({
  argName: "source",
  extension: ".json",
  path: args.source,
});

for (const filePath of filePaths) {
  assertPathExtension({ argName: "files", extension: ".json", path: filePath });
}

runCli(async () => {
  const sourceStrings = await readJsonObjectFile(args.source);

  const results = await Promise.allSettled(
    filePaths.map(async (filePath) => {
      const localeStrings = await readJsonObjectFile(filePath);

      await writePrettierJsonFile(
        filePath,
        syncAndSortLocaleStrings({ localeStrings, sourceStrings }),
      );
    }),
  );

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      // eslint-disable-next-line no-console
      console.log(`Synced and sorted ${filePaths[index]}`);
    } else {
      console.error(
        `Not writing ${filePaths[index]} since an error occurred: ${result.reason instanceof Error ? result.reason.message : String(result.reason)}`,
      );
    }
  });

  if (results.some((result) => result.status === "rejected")) {
    process.exit(1);
  }
});
