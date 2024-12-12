// deno-lint-ignore-file no-explicit-any
import type { TaggedError } from "../error/tagged-error.ts";
import { UnexpectedError } from "../index.ts";
import { Result } from "../result/result.ts";
import type { MaybePromise } from "../types/maybe-promise.ts";
import type { MergeTypes } from "../types/merge-types.ts";

/**
 * An Effect represents a computation that may return a `TValue` or fail with a `TError`,
 * and it may depend on some `TDeps`.
 */
export class Effect<
  TValue = any,
  TError extends TaggedError = never,
  TDeps = void,
> {
  /**
   * Creates an Effect from a simple computation
   */
  static from<TValue, TDeps = void>(
    fn: (deps: TDeps) => MaybePromise<TValue>,
  ): Effect<TValue, never, TDeps> {
    return new Effect(async (deps: TDeps) => {
      const value = await fn(deps);
      return Result.ok(value);
    });
  }

  static withDeps<TValue, TDeps, TError extends TaggedError = never>(
    fn: (deps: TDeps) => Effect<TValue, TError>,
  ): Effect<TValue, TError, TDeps> {
    return new Effect(async (deps: TDeps) => {
      return await fn(deps).fn();
    });
  }

  /**
   * Creates an Effect from a computation that returns a Result
   */
  static fromResult<TValue, TError extends TaggedError = never, TDeps = void>(
    fn: (deps: TDeps) => MaybePromise<Result<TValue, TError>>,
  ): Effect<TValue, TError, TDeps> {
    return new Effect(fn);
  }

  /**
   * Creates an Effect from a simple computation that may throw an error
   * and maps the error to a tagged error
   */
  static tryFrom<TValue, TError extends TaggedError, TDeps = void>(
    fn: (deps: TDeps) => MaybePromise<TValue>,
    errorMapper: (error: any) => TError,
  ): Effect<TValue, TError, TDeps> {
    return new Effect(
      async (deps) => {
        try {
          return Result.ok(await fn(deps));
        } catch (error) {
          return Result.failWith(errorMapper(error));
        }
      },
    );
  }

  static ok(): Effect<void>;
  static ok<TValue>(value: TValue): Effect<TValue>;
  static ok<TValue>(value?: TValue): Effect<any> {
    return new Effect(() => Result.ok(value));
  }

  static failWith<TError extends TaggedError>(
    error: TError,
  ): Effect<never, TError> {
    return new Effect(() => Result.failWith(error));
  }

  constructor(
    private readonly fn: (
      deps: TDeps,
    ) => MaybePromise<Result<TValue, TError>>,
  ) {}

  map<TNewValue>(
    fn: (value: TValue) => MaybePromise<TNewValue>,
  ): Effect<TNewValue, TError, TDeps> {
    return new Effect(async (deps: TDeps) => {
      const result = await this.fn(deps);
      if (result.isError()) {
        return result;
      }
      return Result.ok(await fn(result.value as TValue));
    });
  }

  flatMap<TNewValue, TNewError extends TaggedError, TNewDeps = void>(
    fn: (value: TValue) => Effect<TNewValue, TNewError, TNewDeps>,
  ): Effect<TNewValue, TError | TNewError, MergeTypes<TDeps, TNewDeps>> {
    return new Effect(async (deps: TDeps & TNewDeps) => {
      const result = await this.fn(deps);
      if (result.isError()) {
        return result as Result<TNewValue, TError | TNewError>;
      }
      return await fn(result.value as TValue).fn(deps);
    }) as Effect<
      TNewValue,
      TError | TNewError,
      MergeTypes<TDeps, TNewDeps>
    >;
  }

  mapResult<TNewValue, TNewError extends TaggedError>(
    fn: (value: TValue) => Result<TNewValue, TNewError>,
  ): Effect<TNewValue, TError | TNewError, TDeps> {
    return new Effect(async (deps: TDeps) => {
      const result = await this.fn(deps);
      if (result.isError()) {
        return result as Result<TNewValue, TError | TNewError>;
      }
      return fn(result.value as TValue);
    });
  }

  assertValueOrFailWith<TNewError extends TaggedError>(
    errFn: () => TNewError,
  ): Effect<TValue, TError | TNewError, TDeps> {
    return new Effect(async (deps: TDeps) => {
      const result = await this.fn(deps);
      if (result.isError()) {
        return result;
      }
      if (!result.value) {
        return Result.failWith(errFn());
      }
      return result as Result<TValue, TError | TNewError>;
    });
  }

  assertOrFail<TNewError extends TaggedError>(
    fn: (value: TValue) => Effect<void, TNewError>,
  ): Effect<TValue, TError | TNewError, TDeps> {
    return new Effect(async (deps: TDeps) => {
      const originalValueResult = await this.fn(deps);
      if (originalValueResult.isError()) {
        return originalValueResult;
      }
      const fnResult = await fn(originalValueResult.value as TValue).fn();
      if (fnResult.isError()) {
        return fnResult as Result<TValue, TError | TNewError>;
      }
      return originalValueResult as Result<TValue, TError | TNewError>;
    });
  }

  tryMap<TNewValue, TNewError extends TaggedError>(
    fn: (value: TValue) => MaybePromise<TNewValue>,
    errorMapper: (error: any) => TNewError,
  ): Effect<TNewValue, TError | TNewError, TDeps> {
    return new Effect(async (deps: TDeps) => {
      const result = await this.fn(deps);
      if (result.isError()) {
        return result as Result<TNewValue, TError | TNewError>;
      }
      try {
        return Result.ok(await fn(result.value as TValue));
      } catch (error) {
        return Result.failWith(errorMapper(error));
      }
    });
  }

  errorMap<TNewError extends TaggedError>(
    fn: (err: TError) => TNewError,
  ): Effect<TValue, TNewError, TDeps> {
    return new Effect(async (deps: TDeps) => {
      const result = await this.fn(deps);
      if (result.isError()) {
        return Result.failWith(fn(result.value));
      }
      return result as any as Result<TValue, TNewError>;
    });
  }

  async run(deps: TDeps): Promise<Result<TValue, TError | UnexpectedError>> {
    try {
      return await this.fn(deps);
    } catch (error: any) {
      return Result.failWith(new UnexpectedError(error.message));
    }
  }

  async runOrThrow(deps: TDeps): Promise<TValue> {
    return (await this.fn(deps)).unwrapOrThrow();
  }

  async failOrThrow(deps: TDeps): Promise<TError> {
    return (await this.fn(deps)).unwrapErrorOrThrow();
  }

  // deno-fmt-ignore
  static seq<
    T1,TE1 extends TaggedError,
    T2,TE2 extends TaggedError
  >(
    fn1: () => Effect<T1, TE1>,
    fn2: (value: T1) => Effect<T2, TE2>,
  ): Effect<T2, TE1 | TE2>;

  // deno-fmt-ignore
  static seq<
    T1, TE1 extends TaggedError,
    T2, TE2 extends TaggedError,
    T3, TE3 extends TaggedError,
  >(
    fn1: () => Effect<T1, TE1>,
    fn2: (value: T1) => Effect<T2, TE2>,
    fn3: (value: T2) => Effect<T3, TE3>,
  ): Effect<T3, TE1 | TE2 | TE3>;

  // deno-fmt-ignore
  static seq<
    T1,TE1 extends TaggedError,
    T2,TE2 extends TaggedError,
    T3,TE3 extends TaggedError,
    T4,TE4 extends TaggedError,
  >(
    fn1: () => Effect<T1, TE1>,
    fn2: (value: T1) => Effect<T2, TE2>,
    fn3: (value: T2) => Effect<T3, TE3>,
    fn4: (value: T3) => Effect<T4, TE4>,
  ): Effect<T4, TE1 | TE2 | TE3 | TE4>;

  static seq(
    ...fns: ((...args: any[]) => Effect<any, any>)[]
  ): Effect<any, any> {
    let result = fns[0]!();

    for (let i = 1; i < fns.length; i++) {
      result = result.flatMap((value) => fns[i]!(value));
    }

    return result;
  }
}

export type ExtractEffectDependencies<T> = T extends
  Effect<any, any, infer TDeps> ? TDeps : never;
