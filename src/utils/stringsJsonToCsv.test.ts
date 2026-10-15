import { parse as csvParseSync } from "csv-parse/sync";
import { expect, test } from "vitest";

import { testSchemaJson } from "../testValues/testSchemaJson.js";
import mergeStringsCsvIntoStrings from "./mergeStringsCsvIntoStrings.js";
import stringsJsonToCsv from "./stringsJsonToCsv.js";

const sourceStrings = {
  $schema: "./strings.schema.json",
  page: { quote: 'He said "hi"', title: "Title" },
};

test("generates CSV", () => {
  expect(
    stringsJsonToCsv({
      localeStrings: {
        $schema: "./strings.schema.json",
        page: { quote: "", title: "عنوان" },
      },
      schemaJson: testSchemaJson,
      sourceStrings,
    }),
  ).toBe(
    [
      '"Key","Source","Translation","Description"',
      '"page","---","---","Page."',
      '"page.quote","He said ""hi""","---",""',
      '"page.title","Title","عنوان","Page title. Shown in browser tab."',
    ].join("\n"),
  );
});

test("sorts keys case-insensitively", () => {
  const csv = stringsJsonToCsv({
    // Intentionally unsorted
    // eslint-disable-next-line perfectionist/sort-objects
    localeStrings: { B: "1", a: "2", c: "3" },
    schemaJson: testSchemaJson,
    sourceStrings: {},
  });

  expect(
    csvParseSync(csv)
      .slice(1)
      .map(([key]) => key),
  ).toEqual(["a", "B", "c"]);
});

test("round-trips through mergeStringsCsvIntoStrings", () => {
  const localeStrings = {
    page: { quote: 'او گفت "سلام"', title: "عنوان" },
  };

  expect(
    mergeStringsCsvIntoStrings({
      currentStrings: {},
      stringsCsvTextContent: stringsJsonToCsv({
        localeStrings,
        schemaJson: testSchemaJson,
        sourceStrings,
      }),
    }).mergedStrings,
  ).toEqual(localeStrings);
});
