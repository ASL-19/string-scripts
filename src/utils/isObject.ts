/**
 * Check if a value is a non-null object.
 */
const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export default isObject;
