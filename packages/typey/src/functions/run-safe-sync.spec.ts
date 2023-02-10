import { runSafeSync } from "./run-safe-sync.js";

describe("Run safe (sync)", () => {
    it("Should safely run the function", () => {
        const [thing, err] = runSafeSync(() => "thing");
        expect(thing).toBe("thing");
        expect(err).toBeUndefined();
    });

    it("Should safely throw an error", () => {
        const [thing, err] = runSafeSync(() => {
            throw "An error";
        });
        expect(thing).toBeUndefined();
        expect(err).toBe("An error");
    });
});
