import { shallowClone } from "../cloning/shallow-clone.js";
import { isObject } from "../type-detection/is-object.js";
import { Inmutable } from "./inmutable.js";

export function toInmutable<T>(thing: T): Inmutable<T> {
    if (!isObject(thing)) return thing as Inmutable<T>;
    const inmutableThing = shallowClone(thing);
    for (const key in inmutableThing) {
        if (Object.prototype.hasOwnProperty.call(inmutableThing, key)) {
            inmutableThing[key] = toInmutable(inmutableThing[key]) as any;
        }
    }
    return Object.freeze(inmutableThing) as Inmutable<T>;
}
