#!/usr/bin/env node
import { writeFile } from "fs/promises";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import stringsJsonToCsv from "../utils/stringsJsonToCsv.js";
import assertPathExtension from "./utils/assertPathExtension.js";
import getCliEpilogue from "./utils/getCliEpilogue.js";
import readJsonObjectFile from "./utils/readJsonObjectFile.js";
import runCli from "./utils/runCli.js";

const args = yargs(hideBin(process.argv))
  .options({
    in: {
      demandOption: true,
      description:
        "Strings JSON path to convert, used for the “Translation” column",
      type: "string",
    },
    out: {
      demandOption: true,
      description: "Output path of generated CSV file",
      type: "string",
    },
    schema: {
      demandOption: true,
      description:
        "Strings JSON Schema path, used for the “Description” column",
      type: "string",
    },
    source: {
      demandOption: true,
      description:
        "Source (usually English) strings JSON path, used for the “Source” column",
      type: "string",
    },
  })
  .strict()
  .epilogue(
    getCliEpilogue(
      "convertStringsJsonToCsv --in=src/strings/stringsFa.json --out=src/strings/stringsFa.csv --source=src/strings/stringsEn.json --schema=src/strings/strings.schema.json",
    ),
  )
  .parseSync();

assertPathExtension({ argName: "in", extension: ".json", path: args.in });
assertPathExtension({ argName: "out", extension: ".csv", path: args.out });
assertPathExtension({
  argName: "schema",
  extension: ".json",
  path: args.schema,
});
assertPathExtension({
  argName: "source",
  extension: ".json",
  path: args.source,
});

runCli(async () => {
  const [localeStrings, schemaJson, sourceStrings] = await Promise.all([
    readJsonObjectFile(args.in),
    readJsonObjectFile(args.schema),
    readJsonObjectFile(args.source),
  ]);

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await writeFile(
    args.out,
    stringsJsonToCsv({ localeStrings, schemaJson, sourceStrings }),
    "utf-8",
  );
});
