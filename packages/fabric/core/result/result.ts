// deno-lint-ignore-file no-explicit-any

import { isError } from "../error/is-error.ts";
import type { TaggedError } from "../error/tagged-error.ts";
import { UnexpectedError } from "../error/unexpected-error.ts";

/**
 * A Result represents the outcome of an operation
 * that can be either a value of type `TValue` or an error `TError`.
 */
export class Result<TValue, TError extends TaggedError = never> {
  static succeedWith<T>(value: T): Result<T, never> {
    return new Result<T, never>(value);
  }

  static failWith<T extends TaggedError>(error: T): Result<never, T> {
    return new Result<never, T>(error);
  }

  static ok(): Result<void, never>;
  static ok<T>(value: T): Result<T, never>;
  static ok(value?: any) {
    return new Result(value ?? undefined);
  }

  static tryFrom<T, TError extends TaggedError>(
    fn: () => T,
    errorMapper: (error: any) => TError,
  ): Result<T, TError> {
    try {
      return Result.succeedWith(fn());
    } catch (error) {
      return Result.failWith(errorMapper(error));
    }
  }

  private constructor(readonly value: TValue | TError) {}

  /**
   * Unwrap the value of the result.
   * If the result is an error, it will throw the error.
   */
  unwrapOrThrow(): TValue {
    if (isError(this.value)) {
      throw this.value;
    }

    return this.value as TValue;
  }

  /**
   * Throw the error if the result is an error.
   * otherwise, do nothing.
   */
  orThrow(): void {
    if (isError(this.value)) {
      throw this.value;
    }
  }

  unwrapErrorOrThrow(): TError {
    if (!isError(this.value)) {
      throw new UnexpectedError("Result is not an error");
    }

    return this.value;
  }

  /**
   * Check if the result is a success.
   */
  isOk(): this is Result<TValue, never> {
    return !isError(this.value);
  }

  /**
   * Check if the result is an error.
   */
  isError(): this is Result<never, TError> {
    return isError(this.value);
  }

  /**
   * Map a function over the value of the result.
   */
  map<TMappedValue>(
    fn: (value: TValue) => TMappedValue,
  ): Result<TMappedValue, TError> {
    if (!isError(this.value)) {
      return Result.succeedWith(fn(this.value as TValue));
    }

    return this as any;
  }

  /**
   * Maps a function over the value of the result and flattens the result.
   */
  flatMap<TMappedValue, TMappedError extends TaggedError>(
    fn: (value: TValue) => Result<TMappedValue, TMappedError>,
  ): Result<TMappedValue, TError | TMappedError> {
    if (!isError(this.value)) {
      return fn(this.value as TValue) as any;
    }

    return this as any;
  }

  /**
   * Try to map a function over the value of the result.
   * If the function throws an error, the result will be a failure.
   */
  tryMap<TMappedValue, TNewError extends TaggedError>(
    fn: (value: TValue) => TMappedValue,
    errMapper: (error: any) => TNewError,
  ): Result<TMappedValue, TError | TNewError> {
    if (!isError(this.value)) {
      try {
        return Result.succeedWith(fn(this.value as TValue));
      } catch (error) {
        return Result.failWith(errMapper(error));
      }
    }

    return this as any;
  }

  /**
   * Map a function over the error of the result.
   */
  errorMap<TMappedError extends TaggedError>(
    fn: (error: TError) => TMappedError,
  ): Result<TValue, TMappedError> {
    if (isError(this.value)) {
      return Result.failWith(fn(this.value as TError));
    }

    return this as unknown as Result<TValue, TMappedError>;
  }

  /**
   * Taps a function if the result is a success.
   * This is useful for side effects that do not modify the result.
   */
  tap(fn: (value: TValue) => void): Result<TValue, TError> {
    if (!isError(this.value)) {
      try {
        fn(this.value as TValue);
      } catch {
        // do nothing
      }
    }

    return this;
  }

  assert<TResultValue, TResultError extends TaggedError>(
    fn: (value: TValue) => Result<TResultValue, TResultError>,
  ): Result<TValue, TError | TResultError> {
    return this.flatMap((value) => fn(value).map(() => value));
  }
}
