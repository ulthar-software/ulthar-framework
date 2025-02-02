export function addDevelopmentRebuildListeners() {
  const esbuild = new EventSource("/esbuild");
  esbuild.addEventListener(
    "change",
    () => {
      esbuild.close();
      location.reload();
    },
  );

  window.addEventListener("beforeunload", () => {
    esbuild.close();
  });
}
