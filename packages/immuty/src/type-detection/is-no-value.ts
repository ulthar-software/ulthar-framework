import { isExactlyNaN } from "./is-exactly-nan.js";

export function isNoValue(value: any): boolean {
    return value === undefined || value === null || isExactlyNaN(value);
}
