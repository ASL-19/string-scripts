import isObject from "./isObject.js";

/**
 * Get every value nested in an object (including nested objects and arrays,
 * before their contents), with its flat dot-separated key.
 *
 * @example
 *
 * ```ts
 * getFlatEntries({ a: { b: "foo" } });
 * // [["a", { b: "foo" }], ["a.b", "foo"]]
 * ```
 */
const getFlatEntries = (
  obj: Record<string, unknown>,
  prefix = "",
): Array<[string, unknown]> =>
  Object.entries(obj).flatMap(([key, value]) => {
    const flatKey = prefix ? `${prefix}.${key}` : key;

    return [
      [flatKey, value],
      ...(isObject(value) ? getFlatEntries(value, flatKey) : []),
    ];
  });

export default getFlatEntries;
