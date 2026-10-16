/**
 * Get yargs epilogue with usage example and npm run note.
 */
const getCliEpilogue = (example: string): string =>
  `Example: ${example}\n\nIf running via an npm script make sure you prepend arguments with "--"! See https://docs.npmjs.com/cli/commands/npm-run-script#description`;

export default getCliEpilogue;
