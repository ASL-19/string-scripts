# @asl-19/string-scripts changelog

## 1.0.0 [Unreleased]

Initial release, based on the `convertStringsCsvToJson`, `convertStringsJsonToCsv`, and `syncAndSortStrings` scripts in ASL19 website repositories.

Changes from those scripts:

- Paths are passed as arguments instead of being hard-coded (`--source` and `--schema` are required for `convertStringsJsonToCsv`; `--source` and `--files` are required for `syncAndSortStrings`)
- The CSV “English” column is now called “Source”
- Unknown arguments are rejected
- `syncAndSortStrings` no longer leaks one locale’s strings into another when syncing multiple files
- `convertStringsCsvToJson` no longer strips `"` characters from translations
- `convertStringsCsvToJson` creates the output JSON file if it doesn’t exist
- Scripts exit with code 1 on error
- Script logic is exported as functions
