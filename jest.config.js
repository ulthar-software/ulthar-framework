/** @type {import('ts-jest').JestConfigWithTsJest} */
const config = {
    projects: ["<rootDir>/packages/*"],
    collectCoverage: true,
    coverageDirectory: "<rootDir>/coverage",
    cache: false,
};

export default config;
