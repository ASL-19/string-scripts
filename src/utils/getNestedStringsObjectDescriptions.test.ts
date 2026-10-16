import { expect, test } from "vitest";

import { testSchemaJson } from "../testValues/testSchemaJson.js";
import getNestedStringsObjectDescriptions from "./getNestedStringsObjectDescriptions.js";

test("returns normalized descriptions", () => {
  expect(getNestedStringsObjectDescriptions(testSchemaJson)).toEqual({
    page: {
      $description: "Page.",
      quote: { $description: "" },
      title: { $description: "Page title. Shown in browser tab." },
    },
  });
});

test("skips top-level keys without a matching ${Key}Strings type", () => {
  expect(
    getNestedStringsObjectDescriptions({
      definitions: {
        Strings: { properties: { other: { type: "string" } } },
      },
    }),
  ).toEqual({});
});

test("throws on unexpected schema shape", () => {
  expect(() => getNestedStringsObjectDescriptions({})).toThrow(
    /definitions\.Strings/,
  );
});
