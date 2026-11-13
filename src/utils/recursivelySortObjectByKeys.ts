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
 * Recursively sort object by keys (case-sensitive, by UTF-16 code unit).
 */
const recursivelySortObjectByKeys = (
  object: Record<string, unknown>,
): Record<string, unknown> =>
  Object.fromEntries(
    Object.keys(object)
      .sort()
      .map((key) => [key, recursivelySortValue(object[key])]),
  );

export default recursivelySortObjectByKeys;
