import { isObject } from "../type-detection/is-object.js";
import { isCloneable, MaybeCloneable } from "./cloneable.js";

export function shallowClone<T>(originalThing: T): T {
    if (!isObject(originalThing)) return originalThing;

    if (Array.isArray(originalThing)) {
        return shallowCloneArray(originalThing);
    }

    if (isCloneable(originalThing)) return originalThing.clone();

    return shallowCloneObject(originalThing);
}

function shallowCloneArray<T extends Array<unknown>>(originalArray: T): T {
    return originalArray.slice() as T;
}

function shallowCloneObject<T>(originalObject: T): T {
    const newObject = Object.assign({}, originalObject);
    Object.setPrototypeOf(newObject, Object.getPrototypeOf(originalObject));
    return newObject;
}
