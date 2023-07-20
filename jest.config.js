/** @type {import('ts-jest').JestConfigWithTsJest} */
const config = {
    projects: ["<rootDir>/packages/*"],
    collectCoverage: true,
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
