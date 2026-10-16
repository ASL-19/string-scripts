import isObject from "./isObject.js";

/**
 * Convert nested object to object of values by flat dot-separated key.
 *
 * Non-leaf nodes are included, with their value set to their `$description`
 * (or "" if they don’t have one).
 */
const flattenObject = (
  obj: Record<string, unknown>,
  prefix = "",
): Record<string, string> =>
  Object.entries(obj).reduce<Record<string, string>>((acc, [key, value]) => {
    const newPrefix = prefix ? `${prefix}.${key}` : key;

    return isObject(value)
      ? {
          ...acc,
          [newPrefix]:
            typeof value.$description === "string" ? value.$description : "",
          ...flattenObject(value, newPrefix),
        }
      : { ...acc, [newPrefix]: String(value) };
  }, {});

export default flattenObject;
