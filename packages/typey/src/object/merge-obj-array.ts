/* eslint-disable no-constant-condition */
export function mergeObjectArray<T>(
    arrays: T[][],
    sortPredicate: (objA: T, objB: T) => boolean
) {
    const result: T[] = [];
    const maxSize = arrays.reduce((acc, arr) => acc + arr.length, 0);
    const indexes = new Array(arrays.length).fill(0);

    while (true) {
        let biggestValueIndex = 0;
        let biggestValue: T | null = null;
        for (let i = 0; i < arrays.length; i++) {
            if (indexes[i] == arrays[i].length) continue;

            const currentElement = arrays[i][indexes[i]];
            if (!biggestValue || sortPredicate(currentElement, biggestValue)) {
                biggestValue = currentElement;
                biggestValueIndex = i;
            }
        }

        result.push(biggestValue!);
        indexes[biggestValueIndex]++;

        if (result.length == maxSize) break;
    }

    return result;
}
