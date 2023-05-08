import { isObject } from "../type-detection/is-object.js";

export function deepClone<T>(originalThing: T): T {
    if (!isObject(originalThing)) return originalThing;

    if (Array.isArray(originalThing)) {
        return deepCloneArray(originalThing);
    }

    return deepCloneObject(originalThing);
}

function deepCloneArray<T extends Array<unknown>>(originalArray: T): T {
    const array: any[] = [];
    for (const value of originalArray) {
        array.push(deepClone(value));
    }
    Object.setPrototypeOf(array, Object.getPrototypeOf(array));
    return array as T;
}

function deepCloneObject(originalObject: any) {
    const cloned: any = {};
    for (const key in originalObject) {
        if (Object.hasOwn(originalObject, key)) {
            cloned[key] = deepClone(originalObject[key]);
        }
    }
    Object.setPrototypeOf(cloned, Object.getPrototypeOf(originalObject));
    return cloned;
}
