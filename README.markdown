# @asl-19/string-scripts

A collection of CLI utilities for converting between CSV and JSON formats for string translations and syncing multiple translation files.

This package provides three main CLI tools:

- **convertStringsCsvToJson**: Convert CSV files to JSON format
- **convertStringsJsonToCsv**: Convert JSON files to CSV format
- **syncAndSortStrings**: Sync and sort translation strings between JSON files

See [`docs/`](./docs/) for detailed API documentation.

## Install

```sh
npm install @asl-19/string-scripts
```

## Usage

After installation, you can use the CLI tools directly:

### Convert CSV to JSON

```sh
npx convertStringsCsvToJson --in=input.csv --out=output.json
```

**Real-world example:**
```sh
# Convert Persian translations from CSV to JSON
npx convertStringsCsvToJson --in=src/strings/stringsFa.csv --out=src/strings/stringsFa.json
```

### Convert JSON to CSV

```sh
npx convertStringsJsonToCsv --in=input.json --out=output.csv
```

With optional schema and English translation files:

```sh
npx convertStringsJsonToCsv --in=input.json --out=output.csv --schema=schema.json --english=english.json
```

**Real-world example:**
```sh
# Convert Persian translations from JSON to CSV for translators
npx convertStringsJsonToCsv --in=src/strings/stringsFa.json --out=src/strings/stringsFa.csv
```

### Sync and Sort Strings

```sh
npx syncAndSortStrings --english=english.json --files=translation1.json,translation2.json
```

**Real-world examples:**
```sh
# Sync single translation file with English base
npx syncAndSortStrings --english=src/strings/stringsEn.json --files=src/strings/stringsFa.json

# Sync multiple translation files at once
npx syncAndSortStrings --english=src/strings/stringsEn.json --files=src/strings/stringsFa.json,src/strings/stringsAr.json
```

### Using with npm scripts

You can also add these commands to your `package.json` scripts:

```json
{
  "scripts": {
    "convert-csv-to-json": "convertStringsCsvToJson",
    "convert-json-to-csv": "convertStringsJsonToCsv",
    "sync-strings": "syncAndSortStrings"
  }
}
```

Then run with:

```sh
npm run convert-csv-to-json -- --in=input.csv --out=output.json
npm run convert-json-to-csv -- --in=input.json --out=output.csv --schema=schema.json
npm run sync-strings -- --english=english.json --files=translation1.json,translation2.json
```

**Real-world examples:**
```sh
# Convert Persian translations
npm run convert-csv-to-json -- --in=src/strings/stringsFa.csv --out=src/strings/stringsFa.json
npm run convert-json-to-csv -- --in=src/strings/stringsFa.json --out=src/strings/stringsFa.csv

# Sync translation files
npm run sync-strings -- --english=src/strings/stringsEn.json --files=src/strings/stringsFa.json
```

### Using with Node.js directly

You can also run the scripts directly with Node.js (useful when using `yalc` or local development):

```sh
# Run compiled JavaScript files directly
node node_modules/@asl-19/string-scripts/dist/convertStringsCsvToJson.js --in=input.csv --out=output.json
node node_modules/@asl-19/string-scripts/dist/convertStringsJsonToCsv.js --in=input.json --out=output.csv
node node_modules/@asl-19/string-scripts/dist/syncAndSortStrings.js --english=english.json --files=translation1.json,translation2.json
```

**Real-world examples:**
```sh
# Convert Persian translations using Node directly
node node_modules/@asl-19/string-scripts/dist/convertStringsJsonToCsv.js --in=src/strings/stringsFa.json --out=src/strings/stringsFa.csv
node node_modules/@asl-19/string-scripts/dist/convertStringsCsvToJson.js --in=src/strings/stringsFa.csv --out=src/strings/stringsFa.json

# Sync translation files using Node directly
node node_modules/@asl-19/string-scripts/dist/syncAndSortStrings.js --english=src/strings/stringsEn.json --files=src/strings/stringsFa.json
```

## Features

### convertStringsCsvToJson

Converts CSV files containing translation strings to JSON format. Supports:

- Flat dot-separated keys (e.g., `"user.profile.name"`)
- Automatic conversion to nested JSON objects
- Merging with existing JSON files
- Prettier formatting

### convertStringsJsonToCsv

Converts JSON translation files to CSV format. Supports:

- Nested JSON objects flattened to dot-separated keys
- Optional schema file for descriptions
- Optional English translation file for comparison
- Sorted output by keys

### syncAndSortStrings

Syncs translation strings between JSON files. Features:

- Merges source strings into target file
- Preserves existing translations in target file
- Recursively sorts object keys
- Prettier formatting
- Error handling with detailed messages

## Development

This package is developed with Node.js 22+ (see `engines` field in `package.json`).

In this folder:

```sh
# Watch src and build into dist/ on change
npm run dev

# Build the project
npm run build

# Run linting and type checking
npm run lint-test

# Test CLI tools
npm run test-scripts
```

### Testing CLI Tools

You can test the CLI tools during development:

```sh
# Test help output for all tools
npm run test-scripts

# Test individual tools
npm run test-convert-csv-to-json
npm run test-convert-json-to-csv
npm run test-sync-strings
```

### Local Development

To test changes in another project:

```sh
# Link this package for local development
npm link

# In your test project
npm link @asl-19/string-scripts
```

This creates a symlink so changes in the `dist` directory are immediately available in linked projects.

### Publishing

```sh
# Build and run all checks before publishing
npm run prepublishOnly
```
