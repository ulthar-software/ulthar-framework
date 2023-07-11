/** @type {import('ts-jest').JestConfigWithTsJest} */
const config = {
    preset: "ts-jest/presets/default-esm", // or other ESM presets
    collectCoverageFrom: ["src/**/*.{ts,tsx}"],
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
    cache: false,
};

export default config;
