/* eslint-disable security/detect-non-literal-fs-filename */
import { readFile } from "fs/promises";

import isObject from "../../utils/isObject.js";

/**
 * Read and parse a JSON file whose root is an object.
 *
 * @param missingFileValue - Value to return if the file doesn’t exist (if not
 * provided a missing file throws)
 */
const readJsonObjectFile = async (
  filePath: string,
  { missingFileValue }: { missingFileValue?: Record<string, unknown> } = {},
): Promise<Record<string, unknown>> => {
  let textContent: string;

  try {
    textContent = await readFile(filePath, "utf-8");
  } catch (error) {
    if (
      missingFileValue &&
      isObject(error) &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return missingFileValue;
    }

    throw error;
  }

  const parsed: unknown = JSON.parse(textContent);

  if (!isObject(parsed) || Array.isArray(parsed)) {
    throw new Error(`${filePath} must contain a JSON object`);
  }

  return parsed;
};

export default readJsonObjectFile;
