import { SomeFunction } from "../functions/function.js";

/**
 * An immutable version of a type. It is recursive, so it will make all the properties of a type immutable.
 * It's only a type, so it will not affect the runtime.
 */
/*prettier-ignore*/
export type Immutable<T> = 
    T extends (infer R)[] ? ReadonlyArray<Immutable<R>> : 
    T extends SomeFunction ? T :
    T extends Record<string,any> ? { readonly [K in keyof T]: Immutable<T[K]> } : 
    T;
