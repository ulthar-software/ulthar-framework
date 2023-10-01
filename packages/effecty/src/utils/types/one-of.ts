type OneOnly<Obj, K extends keyof Obj> = {
    [key in Exclude<keyof Obj, K>]?: undefined;
} & { [key in K]: Obj[K] };
type OneOfByKey<Obj> = { [key in keyof Obj]: OneOnly<Obj, key> };
type ValueOf<Obj> = Obj[keyof Obj];
/**
 * Restricts a type T to only one of its keys.
 */
export type OneOf<T> = ValueOf<OneOfByKey<T>>;
