export function flatten<T>(arrays: T[][]) {
    const result = arrays.reduce((a, b) => a.concat(b));
    return new Array(result);
}
