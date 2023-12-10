/** @type {import('ts-jest').JestConfigWithTsJest} */
const config = {
    preset: "ts-jest/presets/default-esm",
    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },
    transform: {
        "^.+\\.[tj]sx?$": [
            "ts-jest",
            {
                useESM: true,
            },
        ],
    },
    projects: ["<rootDir>/packages/*"],
    collectCoverage: false,
    coverageDirectory: "<rootDir>/coverage",
    collectCoverageFrom: [
        "**/*.{ts,tsx}",
        "!**/*.d.ts",
        "!**/index.ts",
        "!**/dist/**/*",
    ],
    passWithNoTests: true,
    cache: false,
};

export default config;
