import lodashMerge from "lodash/merge.js";

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
): Record<string, unknown> => {
  const nestedObject: Record<string, unknown> = {};

  // lodash merge mutates its first argument, which is fine since it’s a new
  // object (and it skips keys like "__proto__", so a CSV can’t pollute
  // Object.prototype)
  lodashMerge(
    nestedObject,
    ...Object.entries(valuesByFlatKeys).map(([flatKey, value]) =>
      flatKey
        .split(".")
        .reduceRight<unknown>((acc, segment) => ({ [segment]: acc }), value),
    ),
  );

  return nestedObject;
};

export default valuesByFlatKeysToNestedObject;
