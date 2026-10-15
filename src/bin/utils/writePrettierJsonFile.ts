/* eslint-disable security/detect-non-literal-fs-filename */
import { writeFile } from "fs/promises";
import prettier from "prettier";

/**
 * Write object to JSON file, formatted with Prettier (using the Prettier
 * config that applies to the file path).
 */
const writePrettierJsonFile = async (
  filePath: string,
  value: unknown,
): Promise<void> => {
  const prettierConfig = (await prettier.resolveConfig(filePath)) ?? {};

  const formattedJsonText = await prettier.format(JSON.stringify(value), {
    ...prettierConfig,
    filepath: filePath,
  });

  await writeFile(filePath, formattedJsonText, "utf-8");
};

export default writePrettierJsonFile;
