#!/usr/bin/env node
import { readFile } from "fs/promises";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import mergeStringsCsvIntoStrings from "../utils/mergeStringsCsvIntoStrings.js";
import assertPathExtension from "./utils/assertPathExtension.js";
import getCliEpilogue from "./utils/getCliEpilogue.js";
import readJsonObjectFile from "./utils/readJsonObjectFile.js";
import runCli from "./utils/runCli.js";
import writePrettierJsonFile from "./utils/writePrettierJsonFile.js";

const args = yargs(hideBin(process.argv))
  .options({
    in: {
      demandOption: true,
      description: "Strings CSV path to convert",
      type: "string",
    },
    out: {
      demandOption: true,
      description:
        "Strings JSON path to merge translations into (created if it doesn’t exist)",
      type: "string",
    },
  })
  .strict()
  .epilogue(
    getCliEpilogue(
      "convertStringsCsvToJson --in=src/strings/stringsFa.csv --out=src/strings/stringsFa.json",
    ),
  )
  .parseSync();

assertPathExtension({ argName: "in", extension: ".csv", path: args.in });
assertPathExtension({ argName: "out", extension: ".json", path: args.out });

runCli(async () => {
  const [currentStrings, stringsCsvTextContent] = await Promise.all([
    readJsonObjectFile(args.out, { missingFileValue: {} }),
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    readFile(args.in, "utf-8"),
  ]);

  await writePrettierJsonFile(
    args.out,
    mergeStringsCsvIntoStrings({ currentStrings, stringsCsvTextContent }),
  );
});
