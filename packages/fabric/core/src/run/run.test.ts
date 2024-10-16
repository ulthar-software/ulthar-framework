// deno-lint-ignore-file require-await
import { describe, expect, test } from "@fabric/testing";
import { UnexpectedError } from "../error/unexpected-error.ts";
import { Result } from "../result/result.ts";
import { Run } from "./run.ts";

describe("Run", () => {
  describe("In Sequence", () => {
    test("should pipe the results of multiple async functions", async () => {
      const result = await Run.seq(
        async () => Result.succeedWith(1),
        async (x) => Result.succeedWith(x + 1),
        async (x) => Result.succeedWith(x * 2)
      );

      expect(result.unwrapOrThrow()).toEqual(4);
    });

    test("should return the first error if one of the functions fails", async () => {
      const result = await Run.seq(
        async () => Result.succeedWith(1),
        async () => Result.failWith(new UnexpectedError()),
        async (x) => Result.succeedWith(x * 2)
      );

      expect(result.isError()).toBe(true);
    });
  });
});
