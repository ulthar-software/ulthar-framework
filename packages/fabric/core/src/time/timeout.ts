export function timeout(
  ms: number,
  options?: {
    signal?: AbortSignal;
  },
): Promise<void> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      resolve();
    }, ms);

    if (options?.signal) {
      options.signal.addEventListener("abort", () => {
        clearTimeout(id);
        reject(new Error("Aborted"));
      });
    }
  });
}
