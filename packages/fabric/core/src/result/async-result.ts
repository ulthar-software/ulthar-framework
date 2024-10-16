// deno-lint-ignore-file no-namespace no-explicit-any
import type { TaggedError } from "../error/tagged-error.ts";
import { UnexpectedError } from "../error/unexpected-error.ts";
import type { MaybePromise } from "../types/maybe-promise.ts";
import { Result } from "./result.ts";

/**
 * An AsyncResult represents the result of an asynchronous operation that can
 * resolve to a value of type `TValue` or an error of type `TError`.
 */
export type AsyncResult<
  TValue = any,
  TError extends TaggedError = never,
> = Promise<Result<TValue, TError>>;

export namespace AsyncResult {
  export async function tryFrom<T, TError extends TaggedError>(
    fn: () => MaybePromise<T>,
    errorMapper: (error: any) => TError,
  ): AsyncResult<T, TError> {
    try {
      return Result.succeedWith(await fn());
    } catch (error) {
      return Result.failWith(errorMapper(error));
    }
  }

  export function from<T>(fn: () => MaybePromise<T>): AsyncResult<T, never> {
    return tryFrom(fn, (error) => new UnexpectedError(error) as never);
  }
}
