import { assert } from "./assert";

describe("Assert", () => {
    it("should throw an error given a falsy value", () => {
        expect(() => {
            assert(false, "An error");
        }).toThrow();
    });
    it("should NOT throw an error given a truthy value", () => {
        expect(() => {
            assert(true, "An error");
        }).not.toThrow();
    });
});
