import { AsyncResult } from "@fabric/core";
import { describe, expect, test } from "@fabric/testing";
import { UnexpectedError } from "../error/unexpected-error.ts";
import { Run } from "./run.ts";

describe("Run", () => {
  describe("In Sequence", () => {
    test("should pipe the results of multiple async functions", async () => {
      const result = Run.seq(
        () => AsyncResult.succeedWith(1),
        (x) => AsyncResult.succeedWith(x + 1),
        (x) => AsyncResult.succeedWith(x * 2),
      );

      expect(await result.unwrapOrThrow()).toEqual(4);
    });

    test("should return the first error if one of the functions fails", async () => {
      const result = await Run.seq(
        () => AsyncResult.succeedWith(1),
        () => AsyncResult.failWith(new UnexpectedError()),
        (x) => AsyncResult.succeedWith(x * 2),
      ).promise();

      expect(result.isError()).toBe(true);
    });
  });
});
