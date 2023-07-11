import { identity } from "./identity.js";

describe("identity function", () => {
    test("given any value, it should return the same value", () => {
        const value = {};
        expect(identity(value)).toBe(value);
    });
});
