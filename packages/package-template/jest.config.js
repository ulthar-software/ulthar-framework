/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    collectCoverage: true,
    jest: {
        transform: {
            "^.+\\.tsx?$": [
                "ts-jest",
                {
                    tsconfig: "tsconfig.spec.json",
                },
            ],
        },
    },
};
