// deno-lint-ignore-file no-namespace no-explicit-any
import type { TaggedError } from "../error/tagged-error.ts";
import type { AsyncResult } from "../result/async-result.ts";

export namespace Run {
  // prettier-ignore
  export function seq<
    T1,
    TE1 extends TaggedError,
    T2,
    TE2 extends TaggedError,
  >(
    fn1: () => AsyncResult<T1, TE1>,
    fn2: (value: T1) => AsyncResult<T2, TE2>,
  ): AsyncResult<T2, TE1 | TE2>;
  // prettier-ignore
  export function seq<
    T1,
    TE1 extends TaggedError,
    T2,
    TE2 extends TaggedError,
    T3,
    TE3 extends TaggedError,
  >(
    fn1: () => AsyncResult<T1, TE1>,
    fn2: (value: T1) => AsyncResult<T2, TE2>,
    fn3: (value: T2) => AsyncResult<T3, TE3>,
  ): AsyncResult<T3, TE1 | TE2 | TE3>;
  // prettier-ignore
  export function seq<
    T1,
    TE1 extends TaggedError,
    T2,
    TE2 extends TaggedError,
    T3,
    TE3 extends TaggedError,
    T4,
    TE4 extends TaggedError,
  >(
    fn1: () => AsyncResult<T1, TE1>,
    fn2: (value: T1) => AsyncResult<T2, TE2>,
    fn3: (value: T2) => AsyncResult<T3, TE3>,
    fn4: (value: T3) => AsyncResult<T4, TE4>,
  ): AsyncResult<T4, TE1 | TE2 | TE3 | TE4>;
  export function seq(
    ...fns: ((...args: any[]) => AsyncResult<any, any>)[]
  ): AsyncResult<any, any> {
    let result = fns[0]!();

    for (let i = 1; i < fns.length; i++) {
      result = result.flatMap((value) => fns[i]!(value));
    }

    return result;
  }

  // prettier-ignore
  export function seqOrThrow<
    T1,
    TE1 extends TaggedError,
    T2,
    TE2 extends TaggedError,
  >(
    fn1: () => AsyncResult<T1, TE1>,
    fn2: (value: T1) => AsyncResult<T2, TE2>,
  ): Promise<T2>;
  // prettier-ignore
  export function seqOrThrow<
    T1,
    TE1 extends TaggedError,
    T2,
    TE2 extends TaggedError,
    T3,
    TE3 extends TaggedError,
  >(
    fn1: () => AsyncResult<T1, TE1>,
    fn2: (value: T1) => AsyncResult<T2, TE2>,
    fn3: (value: T2) => AsyncResult<T3, TE3>,
  ): Promise<T2>;
  export function seqOrThrow(
    ...fns: ((...args: any[]) => AsyncResult<any, any>)[]
  ): Promise<any> {
    const result = (seq as any)(...fns);

    return result.unwrapOrThrow();
  }
}
