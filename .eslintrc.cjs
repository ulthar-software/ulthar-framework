module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/strict",
        "plugin:prettier/recommended",
    ],
    overrides: [
        {
            env: {
                node: true,
            },
            files: [".eslintrc.{js,cjs}"],
            parserOptions: {
                sourceType: "script",
            },
        },
    ],
    ignorePatterns: [
        ".eslintrc.cjs",
        "**/dist/**",
        "node_modules/**",
        "**/*.spec.ts",
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: ["./tsconfig.json", "./packages/*/tsconfig.json"],
    },
    plugins: ["@typescript-eslint", "prettier"],
    rules: {
        "prettier/prettier": "off",
        "linebreak-style": ["error", "unix"],
        quotes: ["error", "double"],
        semi: ["error", "always"],
        "@typescript-eslint/no-namespace": "off",
        "@typescript-eslint/no-unused-vars": [
            "error",
            {
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_",
            },
        ],
        "@typescript-eslint/no-invalid-void-type": "off",
        "no-constant-condition": "off",
        "@typescript-eslint/no-unnecessary-condition": [
            "error",
            {
                allowConstantLoopConditions: true,
            },
        ],
    },
};
