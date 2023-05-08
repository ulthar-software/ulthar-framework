import { isNoValue } from "../type-detection/is-no-value.js";
import { isObject } from "../type-detection/is-object.js";

export function equals(actual: any, expected: any): boolean {
    if (actual === expected) return true;
    if (isNoValue(actual) || isNoValue(expected)) return false;
    if (isObject(actual) && isObject(expected)) {
        return Object.keys(actual).every((key) =>
            equals(actual[key], expected[key])
        );
    }
    return false;
}
