import { expect, test } from "vitest";

import mergeStringsCsvIntoStrings from "./mergeStringsCsvIntoStrings.js";

/**
 * Merge CSV into empty strings object.
 */
const csvToStrings = (stringsCsvTextContent: string) =>
  mergeStringsCsvIntoStrings({ currentStrings: {}, stringsCsvTextContent })
    .mergedStrings;

const csv = [
  '"Key","Source","Translation","Description"',
  '"page","---","---","Page."',
  '"page.quote","He said ""hi""","او گفت «سلام»",""',
  '"page.title","Title","عنوان","Page title."',
  '"page.untranslated","Untranslated","---",""',
].join("\n");

test("merges translations into existing strings without mutating them", () => {
  const currentStrings = {
    $schema: "./strings.schema.json",
    page: { title: "Old", untranslated: "Untranslated" },
  };

  expect(
    mergeStringsCsvIntoStrings({
      currentStrings,
      stringsCsvTextContent: csv,
    }),
  ).toEqual({
    mergedStrings: {
      $schema: "./strings.schema.json",
      page: {
        quote: "او گفت «سلام»",
        title: "عنوان",
        untranslated: "Untranslated",
      },
    },
    unknownFlatKeys: ["page.quote"],
  });

  expect(currentStrings.page.title).toBe("Old");
});

test("nests dot-separated keys", () => {
  expect(
    csvToStrings('"Key","Translation"\n"a.b.c","1"\n"a.b.d","2"\n"e","3"'),
  ).toEqual({ a: { b: { c: "1", d: "2" } }, e: "3" });
});

test("returns keys that weren’t already strings as unknownFlatKeys", () => {
  expect(
    mergeStringsCsvIntoStrings({
      currentStrings: { a: "A", b: { c: "C" } },
      stringsCsvTextContent:
        '"Key","Translation"\n"a","1"\n"b","2"\n"b.c","3"\n"d","4"',
    }).unknownFlatKeys,
  ).toEqual(["b", "d"]);
});

test("handles byte order mark", () => {
  expect(csvToStrings('\uFEFF"Key","Translation"\n"a","عنوان"')).toEqual({
    a: "عنوان",
  });
});

test("preserves quotes in translations", () => {
  expect(csvToStrings('"Key","Translation"\n"a","He said ""hi"""')).toEqual({
    a: 'He said "hi"',
  });
});

test("trims whitespace inside quoted values", () => {
  expect(csvToStrings('"Key","Translation"\n" a ","  عنوان "')).toEqual({
    a: "عنوان",
  });
});

test("finds columns by header name", () => {
  expect(csvToStrings('"Translation","Key"\n"عنوان","title"')).toEqual({
    title: "عنوان",
  });
});

test("throws on empty CSV", () => {
  expect(() => csvToStrings("")).toThrow(/empty/);
});

test("throws on missing header columns", () => {
  expect(() => csvToStrings('"Key","Source"\n"a","A"')).toThrow(/Translation/);
});

test("throws on malformed line", () => {
  expect(() => csvToStrings('"Key","Translation"\n"","عنوان"')).toThrow(
    /malformed/,
  );
});
