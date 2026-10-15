import { expect, test } from "vitest";

import syncAndSortLocaleStrings from "./syncAndSortLocaleStrings.js";

test("adds missing strings from source and keeps existing translations", () => {
  expect(
    syncAndSortLocaleStrings({
      localeStrings: { page: { title: "عنوان" } },
      sourceStrings: { page: { body: "Body", title: "Title" } },
    }),
  ).toEqual({ page: { body: "Body", title: "عنوان" } });
});

test("sorts nested keys (case-sensitive)", () => {
  const synced = syncAndSortLocaleStrings({
    // Intentionally unsorted
    // eslint-disable-next-line perfectionist/sort-objects
    localeStrings: { b: { d: "1", c: "2" }, a: "3", B: "4" },
    sourceStrings: {},
  });

  expect(JSON.stringify(synced)).toBe(
    '{"B":"4","a":"3","b":{"c":"2","d":"1"}}',
  );
});

test("doesn’t leak strings between locales sharing a source object", () => {
  const sourceStrings = { page: { body: "Body", title: "Title" } };

  const fa = syncAndSortLocaleStrings({
    localeStrings: { page: { title: "عنوان فارسی" } },
    sourceStrings,
  });
  const ar = syncAndSortLocaleStrings({
    localeStrings: { page: { body: "نص" } },
    sourceStrings,
  });

  expect(sourceStrings).toEqual({ page: { body: "Body", title: "Title" } });
  expect(fa).toEqual({ page: { body: "Body", title: "عنوان فارسی" } });
  expect(ar).toEqual({ page: { body: "نص", title: "Title" } });
});

test("doesn’t mutate locale strings", () => {
  const localeStrings = { page: { title: "عنوان" } };

  syncAndSortLocaleStrings({
    localeStrings,
    sourceStrings: { page: { body: "Body", title: "Title" } },
  });

  expect(localeStrings).toEqual({ page: { title: "عنوان" } });
});
