/**
 * Run CLI main function, exiting with error code 1 if it throws.
 */
const runCli = (main: () => Promise<void>): void => {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
};

export default runCli;
