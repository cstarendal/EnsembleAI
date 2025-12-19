module.exports = {
  root: true,
  env: { node: true, es2022: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  rules: {
    // Strict complexity rules for src/
    "complexity": ["error", { max: 12 }],
    "max-depth": ["error", { max: 4 }],
    "max-params": ["error", { max: 4 }],
    "max-statements": ["error", { max: 20 }],
    "max-lines-per-function": [
      "error",
      {
        max: 100,
        skipBlankLines: true,
        skipComments: true,
        IIFEs: true,
      },
    ],
    // TypeScript rules
    "@typescript-eslint/explicit-function-return-type": [
      "warn",
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: true,
      },
    ],
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_" },
    ],
  },
  overrides: [
    {
      // Relaxed rules for tests
      files: ["**/__tests__/**", "**/*.test.ts"],
      rules: {
        "max-lines-per-function": "off",
        "complexity": "off",
        "max-depth": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
      },
    },
  ],
};

