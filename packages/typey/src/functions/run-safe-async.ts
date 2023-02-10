import { Maybe } from "../types/maybe";

export async function runSafeAsync<T>(
    fn: () => Promise<T>
): Promise<[Maybe<T>, Maybe<Error>]> {
    try {
        return [await fn(), undefined];
    } catch (err) {
        return [undefined, err as Error];
    }
}
