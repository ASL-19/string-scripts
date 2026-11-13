import isObject from "./isObject.js";

/**
 * Sort objects nested in a value by keys. Arrays stay arrays (in their
 * original order), with any objects in them sorted.
 */
const recursivelySortValue = (value: unknown): unknown =>
  Array.isArray(value)
    ? value.map(recursivelySortValue)
    : isObject(value)
      ? recursivelySortObjectByKeys(value)
      : value;

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
    .reduce<Record<string, unknown>>(
      (acc, key) => ({ ...acc, [key]: recursivelySortValue(object[key]) }),
      {},
    );

export default recursivelySortObjectByKeys;
