import { deepClone } from "./utils/cloning/deep-clone.js";
import { shallowClone } from "./utils/cloning/shallow-clone.js";

export class ImmutableRecord<T extends Record<string, any>> {
    constructor(private value: T) {}

    get<K extends keyof T>(key: K): T[K] {
        return this.value[key];
    }

    set<K extends keyof T>(key: K, value: T[K]) {
        return this.shallowMutate((obj) => (obj[key] = value));
    }

    shallowMutate(mutation: (value: T) => void) {
        const newObj = this.shallowClone();
        mutation(newObj.value);
        return newObj;
    }

    deepMutate(mutation: (value: T) => void) {
        const newObj = this.deepClone();
        mutation(newObj.value);
        return newObj;
    }

    shallowClone() {
        return new ImmutableRecord(shallowClone(this.value));
    }

    deepClone() {
        return new ImmutableRecord(deepClone(this.value));
    }

    asMutable() {
        return shallowClone(this.value);
    }

    toJSON() {
        return deepClone(this.value);
    }
}
