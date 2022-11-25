/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
    preset: "ts-jest/presets/js-with-ts-esm",
    passWithNoTests: true,
    collectCoverageFrom: ["src/**/*.ts", "!src/**/*.spec.ts"],
    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },
    collectCoverage: true,
    transform: {
        "^.+\\.tsx?$": [
            "ts-jest",
            {
                useESM: true,
            },
        ],
    },
};
