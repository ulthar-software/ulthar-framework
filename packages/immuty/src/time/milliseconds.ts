/**
 * Yields a promise that resolve when `ms` milliseconds have passed
 * @param ms Time in milliseconds to wait
 * @returns
 */
export function milliseconds(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
