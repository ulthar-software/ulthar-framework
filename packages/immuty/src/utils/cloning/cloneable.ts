export interface ICloneable<T> {
    clone(): T;
}

export interface MaybeCloneable<T> {
    clone?(): T;
}

export function isCloneable<T>(
    thing: T | MaybeCloneable<T>
): thing is ICloneable<T> {
    return typeof (<any>thing).clone === "function";
}
