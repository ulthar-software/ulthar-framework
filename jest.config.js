/** @type {import('ts-jest').JestConfigWithTsJest} */
const config = {
    projects: ["<rootDir>/packages/*"],
    collectCoverage: true,
    coverageDirectory: "<rootDir>/coverage",
    collectCoverageFrom: ["**/*.{ts,tsx}", "!dist/**/*"],
};

export default config;
