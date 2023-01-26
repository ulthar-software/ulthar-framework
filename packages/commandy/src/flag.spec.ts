import { Flag } from "./flag";

describe("Flag", () => {
    it("should parse a simple flag", () => {
        const flag = new Flag({
            name: "x",
        });

        expect(flag.parse("-x")).toBe(true);
    });
    it("should parse a value flag", () => {
        const flag = new Flag({
            name: "x",
            type: "value",
        });

        expect(flag.parse("-x=foo")).toBe("foo");
    });
    it("should match a simple flag and its aliases", () => {
        const flag = new Flag({
            name: "x",
            aliases: ["execute", "yes"],
        });

        expect(flag.matches("-x")).toBe(true);
        expect(flag.matches("--execute")).toBe(true);
        expect(flag.matches("--yes")).toBe(true);
        expect(flag.matches("-b")).toBe(false);
    });

    it("should match a simple flag and its aliases", () => {
        const flag = new Flag({
            name: "o",
            type: "value",
            aliases: ["output", "otp"],
        });

        expect(flag.matches("-o=foo")).toBe(true);
        expect(flag.matches("--output=foo")).toBe(true);
        expect(flag.matches("--otp=foo")).toBe(true);
        expect(flag.matches("-o")).toBe(false);
        expect(flag.matches("--output")).toBe(false);
    });
});
