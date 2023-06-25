/*prettier-ignore*/
export type Inmutable<T> = 
    T extends (infer R)[] ? ReadonlyArray<Inmutable<R>> : 
    T extends Function ? T :
    T extends Record<string,any> ? { readonly [K in keyof T]: Inmutable<T[K]> } : 
    T;
