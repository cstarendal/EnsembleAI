module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "plugin:react/recommended",
    "plugin:jsx-a11y/recommended",
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs", "vite.config.ts"],
  parser: "@typescript-eslint/parser",
  plugins: ["react-refresh", "@typescript-eslint", "jsx-a11y"],
  settings: {
    react: {
      version: "detect",
    },
  },
  rules: {
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
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
    // React rules
    "react/prop-types": "off", // Using TypeScript instead
    "react/react-in-jsx-scope": "off", // Not needed in React 17+
    // Accessibility
    "jsx-a11y/anchor-is-valid": "warn",
  },
  overrides: [
    {
      // Relaxed rules for tests
      files: ["**/__tests__/**", "**/*.test.{ts,tsx}", "e2e/**"],
      rules: {
        "max-lines-per-function": "off",
        "complexity": "off",
        "max-depth": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
      },
    },
    {
      // Relaxed rules for UI primitives
      files: ["src/components/ui/**"],
      rules: {
        "max-lines-per-function": "off",
      },
    },
  ],
};

