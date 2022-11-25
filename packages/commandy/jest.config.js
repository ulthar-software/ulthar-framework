/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
    preset: "ts-jest",
    testEnvironment: "node",
    collectCoverage: true,
    transform: {
        "^.+\\.tsx?$": [
            "ts-jest",
            {
                tsconfig: "tsconfig.spec.json",
            },
        ],
    },
};
