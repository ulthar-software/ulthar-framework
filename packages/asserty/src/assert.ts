export function assert(value: unknown, errorName: string) {
    if (!value) {
        throw new Error(errorName);
    }
}
