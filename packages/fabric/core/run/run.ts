// deno-lint-ignore-file no-namespace no-explicit-any
import { Effect } from "../effect/index.ts";
import type { TaggedError } from "../error/tagged-error.ts";
import { Result } from "../result/index.ts";

export namespace Run {
  // deno-fmt-ignore
  export function seq<
    T1, TE1 extends TaggedError,
    T2, TE2 extends TaggedError,
  >(
    fn1: () => Effect<T1, TE1>,
    fn2: (value: T1) => Effect<T2, TE2>,
  ): Promise<Result<T2, TE1 | TE2>>;

  // deno-fmt-ignore
  export function seq<
    T1, TE1 extends TaggedError,
    T2, TE2 extends TaggedError,
    T3, TE3 extends TaggedError,
  >(
    fn1: () => Effect<T1, TE1>,
    fn2: (value: T1) => Effect<T2, TE2>,
    fn3: (value: T2) => Effect<T3, TE3>,
  ): Promise<Result<T3, TE1 | TE2 | TE3>>;

  // deno-fmt-ignore
  export function seq<
    T1,TE1 extends TaggedError,
    T2,TE2 extends TaggedError,
    T3,TE3 extends TaggedError,
    T4,TE4 extends TaggedError,
  >(
    fn1: () => Effect<T1, TE1>,
    fn2: (value: T1) => Effect<T2, TE2>,
    fn3: (value: T2) => Effect<T3, TE3>,
    fn4: (value: T3) => Effect<T4, TE4>,
  ): Promise<Result<T4, TE1 | TE2 | TE3 | TE4>>;

  export function seq(
    ...fns: ((...args: any[]) => Effect<any, any>)[]
  ): Promise<Result<any, any>> {
    let result = fns[0]!();

    for (let i = 1; i < fns.length; i++) {
      result = result.flatMap((value) => fns[i]!(value));
    }

    return result.run();
  }

  // deno-fmt-ignore
  export function seqOrThrow<
    T1, TE1 extends TaggedError,
    T2, TE2 extends TaggedError,
  >(
    fn1: () => Effect<T1, TE1>,
    fn2: (value: T1) => Effect<T2, TE2>,
  ): Promise<T2>;

  // deno-fmt-ignore
  export function seqOrThrow<
    T1, TE1 extends TaggedError,
    T2, TE2 extends TaggedError,
    T3, TE3 extends TaggedError,
  >(
    fn1: () => Effect<T1, TE1>,
    fn2: (value: T1) => Effect<T2, TE2>,
    fn3: (value: T2) => Effect<T3, TE3>,
  ): Promise<T2>;

  export async function seqOrThrow(
    ...fns: ((...args: any[]) => Effect<any, any>)[]
  ): Promise<any> {
    const result = await (seq as any)(...fns);

    return result.unwrapOrThrow();
  }
}
