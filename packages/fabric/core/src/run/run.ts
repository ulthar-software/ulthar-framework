/* eslint-disable @typescript-eslint/no-explicit-any */
import { TaggedError } from "../error/tagged-error.js";
import { AsyncResult } from "../result/async-result.js";

export namespace Run {
  // prettier-ignore
  export async function seq<
    T1, TE1 extends TaggedError,
    T2, TE2 extends TaggedError,
  >(
    fn1: () => AsyncResult<T1, TE1>,
    fn2: (value: T1) => AsyncResult<T2, TE2>,
  ): AsyncResult<T2, TE1 | TE2>;
  // prettier-ignore
  export async function seq<
    T1, TE1 extends TaggedError,
    T2, TE2 extends TaggedError,
    T3, TE3 extends TaggedError,
  >(
    fn1: () => AsyncResult<T1, TE1>,
    fn2: (value: T1) => AsyncResult<T2, TE2>,
    fn3: (value: T2) => AsyncResult<T3, TE3>,
  ): AsyncResult<T3, TE1 | TE2 | TE3>;
  // prettier-ignore
  export async function seq<
    T1, TE1 extends TaggedError,
    T2, TE2 extends TaggedError,
    T3, TE3 extends TaggedError,
    T4, TE4 extends TaggedError,
  >(
    fn1: () => AsyncResult<T1, TE1>,
    fn2: (value: T1) => AsyncResult<T2, TE2>,
    fn3: (value: T2) => AsyncResult<T3, TE3>,
    fn4: (value: T3) => AsyncResult<T4, TE4>,
  ): AsyncResult<T4, TE1 | TE2 | TE3 | TE4>;
  export async function seq(
    ...fns: ((...args: any[]) => AsyncResult<any, any>)[]
  ): AsyncResult<any, any> {
    let result = await fns[0]();

    for (let i = 1; i < fns.length; i++) {
      if (result.isError()) {
        return result;
      }

      result = await fns[i](result.unwrapOrThrow());
    }

    return result;
  }

  // prettier-ignore
  export async function seqUNSAFE<
    T1, TE1 extends TaggedError,
    T2, TE2 extends TaggedError,
  >(
    fn1: () => AsyncResult<T1, TE1>,
    fn2: (value: T1) => AsyncResult<T2, TE2>,
  ): Promise<T2>;
  // prettier-ignore
  export async function seqUNSAFE<
    T1,TE1 extends TaggedError,
    T2,TE2 extends TaggedError,
    T3,TE3 extends TaggedError,
  >(
    fn1: () => AsyncResult<T1, TE1>,
    fn2: (value: T1) => AsyncResult<T2, TE2>,
    fn3: (value: T2) => AsyncResult<T3, TE3>,
  ): Promise<T2>;
  export async function seqUNSAFE(
    ...fns: ((...args: any[]) => AsyncResult<any, any>)[]
  ): Promise<any> {
    const result = await (seq as any)(...fns);

    if (result.isError()) {
      throw result.unwrapOrThrow();
    }

    return result.unwrapOrThrow();
  }

  export async function UNSAFE<T, TError extends TaggedError>(
    fn: () => AsyncResult<T, TError>,
  ): Promise<T> {
    return (await fn()).unwrapOrThrow();
  }
}
