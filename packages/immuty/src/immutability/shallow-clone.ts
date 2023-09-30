import { Immutable } from "./immutable.js";

export interface IShallowCloneable {
    shallowClone(): this;
}

export function shallowClone<T>(value: T | Immutable<T>): T {
    if (Array.isArray(value)) {
        return [...value] as T;
    }

    if (typeof value === "object" && value !== null) {
        if ("shallowClone" in value && value.shallowClone instanceof Function) {
            return value.shallowClone() as T;
        }

        return { ...value } as T;
    }

    return value as T;
}
