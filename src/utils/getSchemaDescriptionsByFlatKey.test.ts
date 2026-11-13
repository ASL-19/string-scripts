import { expect, test } from "vitest";

import { testSchemaJson } from "../testValues/testSchemaJson.js";
import getSchemaDescriptionsByFlatKey from "./getSchemaDescriptionsByFlatKey.js";

test("returns normalized descriptions", () => {
  expect(getSchemaDescriptionsByFlatKey(testSchemaJson)).toEqual(
    new Map([
      ["$schema", ""],
      ["page", "Page."],
      ["page.quote", ""],
      ["page.title", "Page title. Shown in browser tab."],
    ]),
  );
});

test("falls back to definitions.Strings without a root $ref", () => {
  expect(
    getSchemaDescriptionsByFlatKey({
      definitions: testSchemaJson.definitions,
    }),
  ).toEqual(getSchemaDescriptionsByFlatKey(testSchemaJson));
});

test("uses the root $ref’s type, whatever it’s called", () => {
  expect(
    getSchemaDescriptionsByFlatKey({
      $ref: "#/definitions/FaqsJson",
      definitions: {
        FaqsJson: {
          properties: {
            $schema: { type: "string" },
            heading: { description: "Heading.", type: "string" },
          },
          type: "object",
        },
      },
    }),
  ).toEqual(
    new Map([
      ["$schema", ""],
      ["heading", "Heading."],
    ]),
  );
});

test("includes types defined inline", () => {
  expect(
    getSchemaDescriptionsByFlatKey({
      $ref: "#/definitions/Strings",
      definitions: {
        Strings: {
          properties: {
            shared: {
              description: "Shared.",
              properties: {
                close: { description: "Close button.", type: "string" },
              },
              type: "object",
            },
          },
          type: "object",
        },
      },
    }),
  ).toEqual(
    new Map([
      ["shared", "Shared."],
      ["shared.close", "Close button."],
    ]),
  );
});

test("follows nested $refs, whatever their types are called", () => {
  expect(
    getSchemaDescriptionsByFlatKey({
      $ref: "#/definitions/Strings",
      definitions: {
        ButtonLabels: {
          description: "Button labels.",
          properties: {
            close: { description: "Close button.", type: "string" },
          },
          type: "object",
        },
        "Record<string,string>": {
          additionalProperties: { type: "string" },
          description: "Record type.",
          type: "object",
        },
        Strings: {
          properties: {
            page: {
              properties: {
                buttons: { $ref: "#/definitions/ButtonLabels" },
                cancelButtons: {
                  $ref: "#/definitions/ButtonLabels",
                  description: "Cancel button labels.",
                },
                other: { $ref: "#/definitions/Record%3Cstring%2Cstring%3E" },
              },
              type: "object",
            },
          },
          type: "object",
        },
      },
    }),
  ).toEqual(
    new Map([
      ["page", ""],
      ["page.buttons", "Button labels."],
      ["page.buttons.close", "Close button."],
      ["page.cancelButtons", "Cancel button labels."],
      ["page.cancelButtons.close", "Close button."],
      ["page.other", "Record type."],
    ]),
  );
});

test("doesn’t include array items’ descriptions", () => {
  expect(
    getSchemaDescriptionsByFlatKey({
      $ref: "#/definitions/FaqsJson",
      definitions: {
        FaqsJson: {
          properties: {
            sections: {
              description: "FAQ sections.",
              items: {
                properties: {
                  title: { description: "Section title.", type: "string" },
                },
                type: "object",
              },
              type: "array",
            },
          },
          type: "object",
        },
      },
    }),
  ).toEqual(new Map([["sections", "FAQ sections."]]));
});

test("stops at recursive types", () => {
  expect(
    getSchemaDescriptionsByFlatKey({
      $ref: "#/definitions/Strings",
      definitions: {
        Node: {
          properties: {
            child: { $ref: "#/definitions/Node", description: "Child." },
            label: { type: "string" },
          },
          type: "object",
        },
        Strings: {
          properties: { node: { $ref: "#/definitions/Node" } },
          type: "object",
        },
      },
    }),
  ).toEqual(
    new Map([
      ["node", ""],
      ["node.child", "Child."],
      ["node.label", ""],
    ]),
  );
});

test("throws on unresolvable $ref", () => {
  expect(() =>
    getSchemaDescriptionsByFlatKey({
      $ref: "#/definitions/Strings",
      definitions: {
        Strings: {
          properties: { page: { $ref: "#/definitions/PageStrings" } },
          type: "object",
        },
      },
    }),
  ).toThrow(/#\/definitions\/PageStrings/);
});

test("throws on non-local $ref", () => {
  expect(() =>
    getSchemaDescriptionsByFlatKey({
      $ref: "other.schema.json#/definitions/Strings",
    }),
  ).toThrow(/only local references/);
});

test("throws on unexpected schema shape", () => {
  expect(() => getSchemaDescriptionsByFlatKey({})).toThrow(
    /#\/definitions\/Strings/,
  );
  expect(() =>
    getSchemaDescriptionsByFlatKey({
      $ref: "#/definitions/Strings",
      definitions: { Strings: { type: "string" } },
    }),
  ).toThrow(/object type with properties/);
});
