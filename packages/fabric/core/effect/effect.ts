// deno-lint-ignore-file no-explicit-any
import type { TaggedError } from "../error/tagged-error.ts";
import { Result } from "../result/result.ts";
import type { MaybePromise } from "../types/maybe-promise.ts";
import type { MergeTypes } from "../types/merge-types.ts";

export class Effect<
  TValue = any,
  TError extends TaggedError = never,
  TDeps = void,
> {
  static from<TValue, TError extends TaggedError = never, TDeps = void>(
    fn: (deps: TDeps) => MaybePromise<Result<TValue, TError>>,
  ): Effect<TValue, TError, TDeps> {
    return new Effect(fn);
  }
  static tryFrom<TValue, TError extends TaggedError = never, TDeps = void>(
    fn: () => MaybePromise<TValue>,
    errorMapper: (error: any) => TError,
  ): Effect<TValue, TError, TDeps> {
    return new Effect(
      async () => {
        try {
          const value = await fn();
          return Result.ok(value);
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
  ) {
  }

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
    fn: (
      value: TValue,
    ) => Effect<TNewValue, TNewError, TNewDeps>,
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

  async run(deps: TDeps): Promise<Result<TValue, TError>> {
    return await this.fn(deps);
  }

  async runOrThrow(deps: TDeps): Promise<TValue> {
    return (await this.fn(deps)).unwrapOrThrow();
  }

  async failOrThrow(deps: TDeps): Promise<TError> {
    return (await this.fn(deps)).unwrapErrorOrThrow();
  }

  static seq<
    T1,
    TE1 extends TaggedError,
    T2,
    TE2 extends TaggedError,
  >(
    fn1: () => Effect<T1, TE1>,
    fn2: (value: T1) => Effect<T2, TE2>,
  ): Effect<T2, TE1 | TE2>;
  static seq<
    T1,
    TE1 extends TaggedError,
    T2,
    TE2 extends TaggedError,
    T3,
    TE3 extends TaggedError,
  >(
    fn1: () => Effect<T1, TE1>,
    fn2: (value: T1) => Effect<T2, TE2>,
    fn3: (value: T2) => Effect<T3, TE3>,
  ): Effect<T3, TE1 | TE2 | TE3>;
  static seq<
    T1,
    TE1 extends TaggedError,
    T2,
    TE2 extends TaggedError,
    T3,
    TE3 extends TaggedError,
    T4,
    TE4 extends TaggedError,
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
