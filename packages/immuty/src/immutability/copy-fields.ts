import { KeyOf } from "../index.js";

export function copyFields<T, Fields extends KeyOf<T>[]>(
    entity: T,
    fields: Fields
): OnlyFields<T, Fields> {
    const result = {} as OnlyFields<T, Fields>;
    for (const field of fields) {
        result[field] = entity[field];
    }
    return result;
}

export type OnlyFields<T, Fields extends KeyOf<T>[]> = {
    [K in Fields[number]]: T[K];
};
