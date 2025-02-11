import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
  },
  {
    ignores: [
      "eslint.config.mjs",
      ".pnp.cjs",
      ".pnp.loader.mjs",
      "**/dist",
      "**/node_modules",
      "**/coverage",
      ".yarn",
    ],
  },
  {
    rules: {
      "@typescript-eslint/no-namespace": ["off"],
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        {
          allowBoolean: true,
          allowNullish: true,
          allowNumber: true,
        },
      ],
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "default",
          format: ["strictCamelCase"],
        },
        {
          selector: "import",
          format: ["strictCamelCase", "UPPER_CASE", "PascalCase"],
        },
        {
          selector: "variable",
          modifiers: ["const"],
          format: ["strictCamelCase", "UPPER_CASE", "PascalCase"],
        },
        {
          selector: "objectLiteralProperty",
          format: null,
        },
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
        {
          selector: "function",
          format: ["strictCamelCase", "PascalCase"],
        },
        {
          selector: "parameter",
          format: ["strictCamelCase"],
          modifiers: ["unused"],
          leadingUnderscore: "allow",
        },
      ],
    },
  },
);
