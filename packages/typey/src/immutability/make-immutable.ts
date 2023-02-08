import { isObject } from "../object/is-object.js";
import { shallowClone } from "../object/shallow-clone.js";
import { Immutable } from "./immutable.js";

export function makeDeepImmutable<T>(thing: T): Immutable<T> {
    if (!isObject(thing)) return thing;
    const inmutableThing = shallowClone(thing);
    for (const key in inmutableThing) {
        if (Object.prototype.hasOwnProperty.call(inmutableThing, key)) {
            inmutableThing[key] = makeDeepImmutable(inmutableThing[key]) as any;
        }
    }
    return Object.freeze(inmutableThing);
}
