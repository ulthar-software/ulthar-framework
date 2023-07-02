import { shallowClone } from "../cloning/shallow-clone.js";
import { isObject } from "../type-detection/is-object.js";
import { Immutable } from "./immutable.js";

export function toDeepImmutable<T>(thing: T): Immutable<T> {
    if (!isObject(thing)) return thing as Immutable<T>;
    const inmutableThing = shallowClone(thing);
    for (const key in inmutableThing) {
        if (Object.prototype.hasOwnProperty.call(inmutableThing, key)) {
            inmutableThing[key] = toDeepImmutable(inmutableThing[key]) as any;
        }
    }
    return Object.freeze(inmutableThing) as Immutable<T>;
}
