import isObject from "./isObject.js";

/**
 * Recursively sort object by keys (case-sensitive).
 *
 * Modernized and simplified version of:
 * http://whitfin.io/sorting-object-recursively-node-jsjavascript/
 */
const recursivelySortObjectByKeys = (
  object: Record<string, unknown>,
): Record<string, unknown> =>
  Object.keys(object)
    .sort((key1, key2) => (key1 < key2 ? -1 : key1 > key2 ? 1 : 0))
    .reduce<Record<string, unknown>>((acc, key) => {
      const value = object[key];

      return {
        ...acc,
        [key]: isObject(value) ? recursivelySortObjectByKeys(value) : value,
      };
    }, {});

export default recursivelySortObjectByKeys;
