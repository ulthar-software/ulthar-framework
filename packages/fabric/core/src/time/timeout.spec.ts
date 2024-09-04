import { describe, expect, test } from "vitest";
import { timeout } from "./timeout.js";

const HEAVY_TESTS =
  process.env.HEAVY_TESTS === "true" || process.env.RUN_ALL_TESTS === "true";

describe("timeout", () => {
  test.runIf(HEAVY_TESTS)(
    "timeout never triggers *before* the input time",
    async () => {
      const count = 10000;
      const maxTimeInMs = 1000;

      const result = await Promise.all(
        new Array(count).fill(0).map(async (e, i) => {
          const start = Date.now();
          const ms = i % maxTimeInMs;
          await timeout(ms);
          const end = Date.now();
          return end - start;
        }),
      );
      expect(
        result
          .map((t, i) => {
            return [t, i % maxTimeInMs]; //Actual time and expected time
          })
          .filter((e) => {
            return e[0] < e[1]; //Actual time is less than the expected time
          }),
      ).toEqual([]);
    },
  );

  test("using ms we can define a timeout in milliseconds", async () => {
    const start = Date.now();
    await timeout(100);
    const end = Date.now();

    const time = end - start;

    expect(time).toBeGreaterThanOrEqual(100);
  });
});
