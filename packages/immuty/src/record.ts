import { shallowClone } from "./utils/cloning/shallow-clone.js";

export class ImmutableRecord<T extends Record<string, any>> {
    constructor(private value: T) {}

    get<K extends keyof T>(key: K): T[K] {
        return this.value[key];
    }

    set<K extends keyof T>(key: K, value: T[K]) {
        return this.mutate((obj) => (obj[key] = value));
    }

    mutate(mutation: (value: T) => void) {
        const newObj = this.copy();
        mutation(newObj.value);
        return newObj;
    }

    copy() {
        return new ImmutableRecord(shallowClone(this.value));
    }

    asMutable() {
        return shallowClone(this.value);
    }

    toJSON() {
        return this.value;
    }
}
