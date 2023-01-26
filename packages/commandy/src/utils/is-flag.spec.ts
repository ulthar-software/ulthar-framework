import { isFlag } from "./is-flag";

describe("isFlag", () => {
    it("should detect if an argument is or is not a flag", () => {
        expect(isFlag("--x")).toBe(true);
        expect(isFlag("banana")).toBe(false);
        expect(isFlag("-banana")).toBe(true);
        expect(isFlag("-y")).toBe(true);
    });
});
