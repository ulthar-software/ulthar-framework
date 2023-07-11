import { TimeSpan } from "./time-span.js";
import { Time } from "./time.js";

describe("Time", () => {
    afterEach(() => {
        Time.setSync(true);
    });

    it("should normally return current time", () => {
        const now = Date.now();
        expect(Time.now()).toBeGreaterThanOrEqual(now);
    });

    it("should work normally when synced", async () => {
        Time.setSync(true);
        const now = Time.now();
        await Time.sleep(TimeSpan.seconds(1));
        expect(Time.now()).toBeGreaterThanOrEqual(now + 1000);
    });

    it("should stop syncing with clock if sync is false", async () => {
        Time.setSync(false);
        const now = Time.now();
        await new Promise((resolve) => {
            setTimeout(resolve, 1000);
        });
        expect(Time.now()).toEqual(now);
    });

    it("should skip time when sync is false", async () => {
        Time.setSync(false);
        const now = Time.now();
        await Time.sleep(TimeSpan.seconds(1));
        expect(Time.now()).toEqual(now + 1000);
    });

    it("should skip time when sync is false and we fast forward", async () => {
        Time.setSync(false);
        const now = Time.now();
        Time.forward(TimeSpan.seconds(1));
        expect(Time.now()).toEqual(now + 1000);
    });
});
