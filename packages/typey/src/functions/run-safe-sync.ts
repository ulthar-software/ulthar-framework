import { Maybe } from "../types/maybe.js";

export function runSafeSync<T>(fn: () => T): [Maybe<T>, Maybe<Error>] {
    try {
        return [fn(), undefined];
    } catch (err) {
        return [undefined, err as Error];
    }
}
