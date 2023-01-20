import { join } from "path";
import { isDirectory } from "./is-directory";

describe("Is directory", () => {
    it("should return true for a directory", async () => {
        expect(await isDirectory(join(__dirname, "../src"))).toBe(true);
    });
    it("should return true for a file", async () => {
        expect(await isDirectory(join(__dirname, "../package.json"))).toBe(
            false
        );
    });
});
