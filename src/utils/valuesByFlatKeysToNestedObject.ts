import lodashFpMerge from "lodash/fp/merge.js";

/**
 * Convert object of values by flat dot-separated key to nested object.
 *
 * @example
 *
 * ```ts
 * valuesByFlatKeysToNestedObject({ "a.b.c": "foo" });
 * // { a: { b: { c: "foo" } } }
 * ```
 */
const valuesByFlatKeysToNestedObject = (
  valuesByFlatKeys: Record<string, string>,
): Record<string, unknown> =>
  Object.entries(valuesByFlatKeys).reduce<Record<string, unknown>>(
    (acc, [flatKey, value]) => {
      const valueObject = flatKey
        .split(".")
        .reduceRight<unknown>((acc, elem) => ({ [elem]: acc }), value);

      return lodashFpMerge(acc, valueObject);
    },
    {},
  );

export default valuesByFlatKeysToNestedObject;
