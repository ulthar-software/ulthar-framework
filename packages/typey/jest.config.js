/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
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
