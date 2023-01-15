/** @type {import('ts-jest').JestConfigWithTsJest} */
const config = {
    preset: "ts-jest/presets/default-esm", // or other ESM presets
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
    passWithNoTests: true,
    collectCoverage: true,
    collectCoverageFrom: ["src/**/*.ts", "!src/**/*.spec.ts"],
    cache: false,
};

export default config;
