import { SomeFunction } from "../functions/function.js";

/*prettier-ignore*/
export type Immutable<T> = 
    T extends (infer R)[] ? ReadonlyArray<Immutable<R>> : 
    T extends SomeFunction ? T :
    T extends Record<string,any> ? { readonly [K in keyof T]: Immutable<T[K]> } : 
    T;
