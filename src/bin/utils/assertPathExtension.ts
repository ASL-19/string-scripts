/**
 * Exit with error if path doesn’t have expected extension.
 */
const assertPathExtension = ({
  argName,
  extension,
  path,
}: {
  argName: string;
  extension: ".csv" | ".json";
  path: string;
}): void => {
  if (!path.endsWith(extension)) {
    console.error(
      `--${argName} argument must be a ${extension.slice(1).toUpperCase()} path (got "${path}")`,
    );
    process.exit(1);
  }
};

export default assertPathExtension;
