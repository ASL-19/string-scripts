/** @type {import("prettier").Config} */
const prettierConfig = {
  overrides: [
    {
      files: ["*.json"],
      options: {
        // Prevent consolidating multiple values on one line
        printWidth: 1,
      },
    },
  ],
};

export default prettierConfig;
