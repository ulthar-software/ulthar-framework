export function timeout(ms: number) {
  return new Promise<void>((resolve) => {
    const start = Date.now();
    setTimeout(() => {
      const end = Date.now();
      const remaining = ms - (end - start);
      if (remaining > 0) {
        timeout(remaining).then(resolve);
      } else {
        resolve();
      }
    }, ms);
  });
}
