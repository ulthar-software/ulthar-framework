import { runSafeAsync } from "./run-safe-async.js";

describe("Run safe (async)", () => {
    it("Should safely run the async function", async () => {
        const [thing, err] = await runSafeAsync(async () => "thing");
        expect(thing).toBe("thing");
        expect(err).toBeUndefined();
    });

    it("Should safely throw an error", async () => {
        const [thing, err] = await runSafeAsync(async () => {
            throw "An error";
        });
        expect(thing).toBeUndefined();
        expect(err).toBe("An error");
    });
});
