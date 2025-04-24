export function generatePath(path: string): string {
  const pathParts = path
    .replace(/^\.\//, "")
    .replace(/\.tsx$/, "")
    .replace(/index$/, "")
    .replace(/\/$/, "")
    .replace(/\[(.+?)\]/g, ":$1")
    .split("/")
    .filter((part) => part !== "pages" && part !== "src");

  return `/${pathParts.join("/")}`;
}
