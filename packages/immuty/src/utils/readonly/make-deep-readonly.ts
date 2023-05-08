import { shallowClone } from "../cloning/shallow-clone.js";
import { isObject } from "../type-detection/is-object.js";
import { DeepReadonly } from "./deep-readonly.js";

export function makeDeepReadonly<T>(thing: T): DeepReadonly<T> {
    if (!isObject(thing)) return thing;
    const inmutableThing = shallowClone(thing);
    for (const key in inmutableThing) {
        if (Object.prototype.hasOwnProperty.call(inmutableThing, key)) {
            inmutableThing[key] = makeDeepReadonly(inmutableThing[key]) as any;
        }
    }
    return Object.freeze(inmutableThing);
}
