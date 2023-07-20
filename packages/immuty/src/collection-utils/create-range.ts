export function createRange(start: number, end: number, step?: number) {
    const result = [];

    const increment = step || 1;

    for (let i = start; i <= end; i = increment + i) {
        result.push(i);
    }

    return result;
}
