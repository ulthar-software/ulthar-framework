import { describe, expect, test } from "@fabric/testing";
import { UnexpectedError } from "../error/unexpected-error.ts";
import { Result } from "./result.ts";

describe("Result", () => {
  test("Result.succeedWith should create a successful Result", () => {
    const result = Result.succeedWith(42);
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOrThrow()).toBe(42);
  });

  test("Result.failWith should create a failed Result", () => {
    const error = new UnexpectedError("failure");
    const result = Result.failWith(error);
    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow()).toBe(error);
  });

  test("Result.ok should create a successful Result with a value", () => {
    const result = Result.ok(42);
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOrThrow()).toBe(42);
  });

  test("Result.ok should create a successful Result without a value", () => {
    const result = Result.ok();
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOrThrow()).toBeUndefined();
  });

  test("Result.tryFrom should create a successful Result if the function does not throw", () => {
    const result = Result.tryFrom(
      () => 42,
      (e) => new UnexpectedError(e.message),
    );
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOrThrow()).toBe(42);
  });

  test("Result.tryFrom should create a failed Result if the function throws", () => {
    const result = Result.tryFrom(() => {
      throw new Error("failure");
    }, (e) => new UnexpectedError(e.message));
    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(UnexpectedError);
    expect(result.unwrapErrorOrThrow().message).toBe("failure");
  });

  test("unwrapOrThrow should return the value if the Result is successful", () => {
    const result = Result.succeedWith(42);
    expect(result.unwrapOrThrow()).toBe(42);
  });

  test("unwrapOrThrow should throw the error if the Result is a failure", () => {
    const error = new UnexpectedError("failure");
    const result = Result.failWith(error);
    expect(() => result.unwrapOrThrow()).toThrow(error);
  });

  test("orThrow should do nothing if the Result is successful", () => {
    const result = Result.succeedWith(42);
    expect(() => result.orThrow()).not.toThrow();
  });

  test("orThrow should throw the error if the Result is a failure", () => {
    const error = new UnexpectedError("failure");
    const result = Result.failWith(error);
    expect(() => result.orThrow()).toThrow(error);
  });

  test("unwrapErrorOrThrow should return the error if the Result is a failure", () => {
    const error = new UnexpectedError("failure");
    const result = Result.failWith(error);
    expect(result.unwrapErrorOrThrow()).toBe(error);
  });

  test("unwrapErrorOrThrow should throw an UnexpectedError if the Result is successful", () => {
    const result = Result.succeedWith(42);
    expect(() => result.unwrapErrorOrThrow()).toThrow(UnexpectedError);
  });

  test("isOk should return true if the Result is successful", () => {
    const result = Result.succeedWith(42);
    expect(result.isOk()).toBe(true);
  });

  test("isOk should return false if the Result is a failure", () => {
    const result = Result.failWith(new UnexpectedError("failure"));
    expect(result.isOk()).toBe(false);
  });

  test("isError should return true if the Result is a failure", () => {
    const result = Result.failWith(new UnexpectedError("failure"));
    expect(result.isError()).toBe(true);
  });

  test("isError should return false if the Result is successful", () => {
    const result = Result.succeedWith(42);
    expect(result.isError()).toBe(false);
  });

  test("map should map a successful Result to a new successful Result", () => {
    const result = Result.succeedWith(42).map((value) => value * 2);
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOrThrow()).toBe(84);
  });

  test("map should skip maps when the Result is an error", () => {
    const result = Result.failWith(new UnexpectedError("failure")).map((
      value,
    ) => value * 2);
    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(UnexpectedError);
    expect(result.unwrapErrorOrThrow().message).toBe("failure");
  });

  test("flatMap should map a successful Result to a new successful Result", () => {
    const result = Result.succeedWith(42).flatMap((value) =>
      Result.succeedWith(value * 2)
    );
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOrThrow()).toBe(84);
  });

  test("flatMap should map a successful Result to a new failed Result", () => {
    const result = Result.succeedWith(42).flatMap(() =>
      Result.failWith(new UnexpectedError("failure"))
    );
    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(UnexpectedError);
    expect(result.unwrapErrorOrThrow().message).toBe("failure");
  });

  test("flatMap should skip maps when the Result is an error", () => {
    const result = Result.failWith(new UnexpectedError("failure")).flatMap((
      value,
    ) => Result.succeedWith(value * 2));
    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(UnexpectedError);
    expect(result.unwrapErrorOrThrow().message).toBe("failure");
  });

  test("tryMap should map a successful Result to a new successful Result", () => {
    const result = Result.succeedWith(42).tryMap(
      (value) => value * 2,
      (e) => new UnexpectedError(e.message),
    );
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOrThrow()).toBe(84);
  });

  test("tryMap should return a failed Result if the mapping function throws an error", () => {
    const result = Result.succeedWith(42).tryMap(() => {
      throw new Error("failure");
    }, (e) => new UnexpectedError(e.message));
    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(UnexpectedError);
    expect(result.unwrapErrorOrThrow().message).toBe("failure");
  });

  test("tryMap should skip maps when the Result is an error", () => {
    const result = Result.failWith(new UnexpectedError("failure")).tryMap(
      (value) => value * 2,
      (e) => new UnexpectedError(e.message),
    );
    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(UnexpectedError);
    expect(result.unwrapErrorOrThrow().message).toBe("failure");
  });

  test("errorMap should map a failed Result to a new failed Result", () => {
    const result = Result.failWith(new UnexpectedError("failure")).errorMap((
      error,
    ) => new UnexpectedError(error.message + " mapped"));
    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(UnexpectedError);
    expect(result.unwrapErrorOrThrow().message).toBe("failure mapped");
  });

  test("errorMap should skip maps when the Result is successful", () => {
    // deno-lint-ignore no-explicit-any
    const result = Result.succeedWith(42).errorMap((error: any) =>
      new UnexpectedError(error.message + " mapped")
    );
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOrThrow()).toBe(42);
  });

  test("tap should execute the function if the Result is successful", () => {
    let tappedValue = 0;
    const result = Result.succeedWith(42).tap((value) => {
      tappedValue = value;
    });
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOrThrow()).toBe(42);
    expect(tappedValue).toBe(42);
  });

  test("tap should not execute the function if the Result is a failure", () => {
    let tappedValue = 0;
    const result = Result.failWith(new UnexpectedError("failure")).tap(
      (value) => {
        tappedValue = value;
      },
    );
    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(UnexpectedError);
    expect(result.unwrapErrorOrThrow().message).toBe("failure");
    expect(tappedValue).toBe(0);
  });

  test("tap should not break the next mappings if the function throws an error", () => {
    const result = Result.succeedWith(42)
      .tap(() => {
        throw new Error("tap error"); //this should not break the chain, as tap is a side effect
      })
      .map((value) => value * 2);
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOrThrow()).toBe(84);
  });

  test("assert should return the original Result if the assertion passes", () => {
    const result = Result.succeedWith(42).assert((value) =>
      Result.succeedWith(value)
    );
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOrThrow()).toBe(42);
  });

  test("assert should return a failed Result if the assertion fails", () => {
    const result = Result.succeedWith(42).assert(() =>
      Result.failWith(new UnexpectedError("assertion failure"))
    );
    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(UnexpectedError);
    expect(result.unwrapErrorOrThrow().message).toBe("assertion failure");
  });

  test("assert should skip assertions when the Result is an error", () => {
    const result = Result.failWith(new UnexpectedError("failure")).assert((
      value,
    ) => Result.succeedWith(value));
    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(UnexpectedError);
    expect(result.unwrapErrorOrThrow().message).toBe("failure");
  });
});
