export function addDevelopmentRebuildListeners() {
  const esbuild = new EventSource("/esbuild");
  esbuild.addEventListener("change", () => {
    esbuild.close();
    location.reload();
  });

  globalThis.addEventListener("beforeunload", () => {
    esbuild.close();
  });
}
