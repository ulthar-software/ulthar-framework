import { KeyOf } from "../index.js";

export function copyFields<T, F extends KeyOf<T>>(
    entity: T,
    fields: F[]
): OnlyFields<T, F> {
    const result = {} as OnlyFields<T, F>;
    for (const field of fields) {
        result[field] = entity[field];
    }
    return result;
}

export type OnlyFields<T, F extends KeyOf<T>> = {
    [K in F]: T[K];
};
