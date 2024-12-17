import { describe, expect, expectTypeOf, fnMock, test } from "@fabric/testing";
import { UnexpectedError } from "../index.ts";
import { Result } from "../result/result.ts";
import { Effect, type ExtractEffectDependencies } from "./effect.ts";

describe("Effect", () => {
  test("Effect.from should create an Effect that returns a successful Result", async () => {
    const effect = Effect.fromResult(() => Result.ok(42));
    const result = await effect.run();
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOrThrow()).toBe(42);
  });

  test("Effect.from should create an Effect that returns a failed Result with the correct error type and message", async () => {
    const effect = Effect.fromResult(() =>
      Result.failWith(new UnexpectedError("failure"))
    );
    const result = await effect.run();
    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(UnexpectedError);
    expect(result.unwrapErrorOrThrow().message).toBe("failure");
  });

  test("Effect.tryFrom should create an Effect that returns a successful Result", async () => {
    const effect = Effect.tryFrom(
      () => Promise.resolve(42),
      (e) => new UnexpectedError(e.message),
    );
    const result = await effect.run();
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOrThrow()).toBe(42);
  });

  test("Effect.tryFrom should create an Effect that returns a failed Result with the correct error type and message", async () => {
    const effect = Effect.tryFrom(
      () => Promise.reject(new Error("failure")),
      (e) => new UnexpectedError(e.message),
    );
    const result = await effect.run();
    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(UnexpectedError);
    expect(result.unwrapErrorOrThrow().message).toBe("failure");
  });

  test("Effect.ok should create an Effect that returns a successful Result", async () => {
    const effect = Effect.ok(42);
    const result = await effect.run();
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOrThrow()).toBe(42);
  });

  test("Effect.failWith should create an Effect that returns a failed Result with the correct error type and message", async () => {
    const effect = Effect.failWith(new UnexpectedError("failure"));
    const result = await effect.run();
    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(UnexpectedError);
    expect(result.unwrapErrorOrThrow().message).toBe("failure");
  });

  test("Effect.map should map a successful Result to a new successful Result", async () => {
    const effect = Effect.ok(42).map((value) => value * 2);
    const result = await effect.run();
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOrThrow()).toBe(84);
  });

  test("Effect.map should skip maps when the Result is an error", async () => {
    const mockFn = fnMock<() => number>();
    const effect = Effect.failWith(new UnexpectedError("failure")).map(
      mockFn,
    );
    const result = await effect.run();
    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(UnexpectedError);
    expect(result.unwrapErrorOrThrow().message).toBe("failure");
    expect(mockFn).not.toHaveBeenCalled();
  });

  test(
    "Effect.flatMap should map a successful Effect to a new Effect",
    async () => {
      const effect = Effect.ok(42).flatMap((value) => Effect.ok(value * 2));
      const result = await effect.run();
      expect(result.isOk()).toBe(true);
      expect(result.unwrapOrThrow()).toBe(84);
    },
  );

  test("Effect.flatMap should map a successful Effect to a new failed Effect", async () => {
    const effect = Effect.ok(42).flatMap(() =>
      Effect.failWith(new UnexpectedError("failure"))
    );
    const result = await effect.run();
    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(UnexpectedError);
    expect(result.unwrapErrorOrThrow().message).toBe("failure");
  });

  test("Effect.flatMap should skip maps when the Result is an error", async () => {
    const mockFn = fnMock<() => Effect<number, UnexpectedError>>();
    const effect = Effect.failWith(new UnexpectedError("failure")).flatMap(
      mockFn,
    );
    const result = await effect.run();
    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(UnexpectedError);
    expect(result.unwrapErrorOrThrow().message).toBe("failure");
    expect(mockFn).not.toHaveBeenCalled();
  });

  test("Effect.flatMap should result in an effect which requires both dependencies", async () => {
    const effect = Effect.fromResult(({ a }: { a: number }) => Result.ok(a * 2))
      .flatMap((value) =>
        Effect.fromResult(({ b }: { b: number }) => Result.ok(value + b))
      );

    const result = await effect.run({ a: 1, b: 2 });
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOrThrow()).toBe(4);

    //This should fail to compile
    //await effect.run({ a: 1 });

    type Deps = ExtractEffectDependencies<typeof effect>;

    expectTypeOf<Deps>().toEqualTypeOf<{ a: number } & { b: number }>();
  });

  test("Effect.flatMap should work if an effect has dependencies and the other effect does not", async () => {
    const effect = Effect.fromResult(({ a }: { a: number }) => Result.ok(a * 2))
      .flatMap((value) => Effect.ok(value + 2));

    const result = await effect.run({ a: 1 });
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOrThrow()).toBe(4);

    type Deps = ExtractEffectDependencies<typeof effect>;

    expectTypeOf<Deps>().toEqualTypeOf<{ a: number }>();
  });

  test("Effect.seq should run multiple effects in sequence", async () => {
    const effect = Effect.seq(
      () => Effect.ok(1),
      (x) => Effect.ok(x + 1),
      (x) => Effect.ok(x * 2),
    );

    const result = await effect.run();
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOrThrow()).toBe(4);
  });

  test("Effect.assertValueOrFailWith should return a successful Result if value is present", async () => {
    const effect = Effect.ok(42).assertValueOrFailWith(() =>
      new UnexpectedError("failure")
    );
    const result = await effect.run();
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOrThrow()).toBe(42);
  });

  test("Effect.assertValueOrFailWith should return a failed Result if value is not present", async () => {
    const effect = Effect.ok(null).assertValueOrFailWith(() =>
      new UnexpectedError("failure")
    );
    const result = await effect.run();
    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(UnexpectedError);
    expect(result.unwrapErrorOrThrow().message).toBe("failure");
  });

  test("Effect.assertValueOrFailWith should return a failed Result if the original effect returns an error", async () => {
    const effect = Effect.failWith(new UnexpectedError("original failure"))
      .assertValueOrFailWith(() => new UnexpectedError("assertion failure"));
    const result = await effect.run();
    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(UnexpectedError);
    expect(result.unwrapErrorOrThrow().message).toBe("original failure");
  });

  test("Effect.tryMap should map a successful Result to a new successful Result", async () => {
    const effect = Effect.ok(42).tryMap(
      (value) => value * 2,
      (e) => new UnexpectedError(e.message),
    );
    const result = await effect.run();
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOrThrow()).toBe(84);
  });

  test("Effect.tryMap should return a failed Result if the mapping function throws an error", async () => {
    const effect = Effect.ok(42).tryMap(
      () => {
        throw new Error("failure");
      },
      (e) => new UnexpectedError(e.message),
    );
    const result = await effect.run();
    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(UnexpectedError);
    expect(result.unwrapErrorOrThrow().message).toBe("failure");
  });

  test("Effect.tryMap should skip maps when the original effect returns an error", async () => {
    const mockFn = fnMock<() => number>();
    const effect = Effect.failWith(new UnexpectedError("failure")).tryMap(
      mockFn,
      (e) => new UnexpectedError(e.message),
    );
    const result = await effect.run();
    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(UnexpectedError);
    expect(result.unwrapErrorOrThrow().message).toBe("failure");
    expect(mockFn).not.toHaveBeenCalled();
  });

  test("Effect.mapResult should map a successful Result to a new successful Result", async () => {
    const effect = Effect.ok(42).mapResult((value) => Result.ok(value * 2));
    const result = await effect.run();
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOrThrow()).toBe(84);
  });

  test("Effect.mapResult should return a failed Result if the mapping function returns a failed Result", async () => {
    const effect = Effect.ok(42).mapResult(() =>
      Result.failWith(new UnexpectedError("failure"))
    );
    const result = await effect.run();
    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(UnexpectedError);
    expect(result.unwrapErrorOrThrow().message).toBe("failure");
  });

  test("Effect.mapResult should skip maps when the Result is an error", async () => {
    const mockFn = fnMock<() => Result<number, UnexpectedError>>();
    const effect = Effect.failWith(new UnexpectedError("failure")).mapResult(
      mockFn,
    );
    const result = await effect.run();
    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(UnexpectedError);
    expect(result.unwrapErrorOrThrow().message).toBe("failure");
    expect(mockFn).not.toHaveBeenCalled();
  });

  test("Effect.runOrThrow should return the value if the Result is successful", async () => {
    const effect = Effect.ok(42);
    const value = await effect.runOrThrow();
    expect(value).toBe(42);
  });

  test("Effect.runOrThrow should throw an error if the Result is a failure", async () => {
    const effect = Effect.failWith(new UnexpectedError("failure"));
    await expect(effect.runOrThrow()).rejects.toThrow(UnexpectedError);
  });

  test("Effect.failOrThrow should return the error if the Result is a failure", async () => {
    const effect = Effect.failWith(new UnexpectedError("failure"));
    const error = await effect.failOrThrow();
    expect(error).toBeInstanceOf(UnexpectedError);
    expect(error.message).toBe("failure");
  });

  test("Effect.failOrThrow should throw an error if the Result is successful", async () => {
    const effect = Effect.ok(42);
    await expect(effect.failOrThrow()).rejects.toThrow(UnexpectedError);
  });

  test("Effect.from should create an Effect that returns a successful Result with dependencies", async () => {
    const effect = Effect.from(({ a }: { a: number }) => a * 2);
    const result = await effect.run({ a: 21 });
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOrThrow()).toBe(42);
  });

  test("Effect.withDeps should create an Effect that returns a successful Result with dependencies", async () => {
    const effect = Effect.withDeps(({ a }: { a: number }) => Effect.ok(a * 2));
    const result = await effect.run({ a: 21 });
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOrThrow()).toBe(42);
  });

  test("Effect.fromResult should create an Effect that returns a successful Result with dependencies", async () => {
    const effect = Effect.fromResult(({ a }: { a: number }) =>
      Result.ok(a * 2)
    );
    const result = await effect.run({ a: 21 });
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOrThrow()).toBe(42);
  });

  test("Effect.fromResult should create an Effect that returns a failed Result with dependencies", async () => {
    const effect = Effect.fromResult(({}: { a: number }) =>
      Result.failWith(new UnexpectedError("failure"))
    );
    const result = await effect.run({ a: 21 });
    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(UnexpectedError);
    expect(result.unwrapErrorOrThrow().message).toBe("failure");
  });

  test("Effect.tryFrom should create an Effect that returns a successful Result with dependencies", async () => {
    const effect = Effect.tryFrom(
      ({ a }: { a: number }) => Promise.resolve(a * 2),
      (e) => new UnexpectedError(e.message),
    );
    const result = await effect.run({ a: 21 });
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOrThrow()).toBe(42);
  });

  test("Effect.tryFrom should create an Effect that returns a failed Result with dependencies", async () => {
    const effect = Effect.tryFrom(
      ({}: { a: number }) => Promise.reject(new Error("failure")),
      (e) => new UnexpectedError(e.message),
    );
    const result = await effect.run({ a: 21 });
    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(UnexpectedError);
    expect(result.unwrapErrorOrThrow().message).toBe("failure");
  });

  test("Effect.ok should create an Effect that returns a successful Result with dependencies", async () => {
    const effect = Effect.ok(42);
    const result = await effect.run();
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOrThrow()).toBe(42);
  });

  test("Effect.failWith should create an Effect that returns a failed Result with dependencies", async () => {
    const effect = Effect.failWith(new UnexpectedError("failure"));
    const result = await effect.run();
    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(UnexpectedError);
    expect(result.unwrapErrorOrThrow().message).toBe("failure");
  });

  test("Effect.seq should run multiple effects in sequence with dependencies", async () => {
    const effect = Effect.seq(
      () => Effect.ok(1),
      (x) => Effect.ok(x + 1),
      (x) => Effect.ok(x * 2),
    );

    const result = await effect.run();
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOrThrow()).toBe(4);
  });

  test("Effect.seq should run multiple effects in sequence with dependencies and fail if any effect fails", async () => {
    const effect = Effect.seq(
      () => Effect.ok(1),
      () => Effect.failWith(new UnexpectedError("failure")),
      (x) => Effect.ok(x * 2),
    );

    const result = await effect.run();
    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(UnexpectedError);
    expect(result.unwrapErrorOrThrow().message).toBe("failure");
  });

  test("Effect.run should catch errors thrown by the effect function and return an UnexpectedError", async () => {
    const effect = new Effect(() => {
      throw new Error("unexpected failure");
    });
    const result = await effect.run();
    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(UnexpectedError);
    expect(result.unwrapErrorOrThrow().message).toBe("unexpected failure");
  });

  test("Effect.assertOrFail should return a successful Result if the assertion passes", async () => {
    const effect = Effect.ok(42).assertOrFail(() =>
      Effect.fromResult(() => Result.ok())
    );
    const result = await effect.run();
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOrThrow()).toBe(42);
  });

  test("Effect.assertOrFail should return a failed Result if the assertion fails", async () => {
    const effect = Effect.ok(42).assertOrFail(() =>
      Effect.failWith(new UnexpectedError("failure"))
    );
    const result = await effect.run();
    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(UnexpectedError);
    expect(result.unwrapErrorOrThrow().message).toBe("failure");
  });

  test("Effect.assertOrFail should return a failed Result if the original effect returns an error", async () => {
    const effect = Effect.failWith(new UnexpectedError("original failure"))
      .assertOrFail(() => Effect.ok());
    const result = await effect.run();
    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(UnexpectedError);
    expect(result.unwrapErrorOrThrow().message).toBe("original failure");
  });
});
