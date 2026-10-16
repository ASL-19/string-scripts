/* eslint-disable security/detect-non-literal-fs-filename */
import { readFile } from "fs/promises";

import isObject from "../../utils/isObject.js";

/**
 * Read and parse a JSON file whose root is an object.
 *
 * @param allowMissing - If true, return null if the file doesn’t exist
 * (otherwise a missing file throws)
 */
async function readJsonObjectFile(
  filePath: string,
  options?: { allowMissing?: false },
): Promise<Record<string, unknown>>;
async function readJsonObjectFile(
  filePath: string,
  options: { allowMissing: true },
): Promise<null | Record<string, unknown>>;
async function readJsonObjectFile(
  filePath: string,
  { allowMissing = false }: { allowMissing?: boolean } = {},
): Promise<null | Record<string, unknown>> {
  let textContent: string;

  try {
    textContent = await readFile(filePath, "utf-8");
  } catch (error) {
    if (
      allowMissing &&
      isObject(error) &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return null;
    }

    throw error;
  }

  const parsed: unknown = JSON.parse(textContent);

  if (!isObject(parsed) || Array.isArray(parsed)) {
    throw new Error(`${filePath} must contain a JSON object`);
  }

  return parsed;
}

export default readJsonObjectFile;
