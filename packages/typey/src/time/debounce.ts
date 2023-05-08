import { MaybePromise } from "../types/maybe-promise.js";

export function debounce(
    fn: (...args: any[]) => MaybePromise<void>,
    delay: number
) {
    let timeoutId: number;

    return (...args: any[]) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            fn(...args);
        }, delay) as unknown as number;
    };
}
