export function generatePath(path: string): string {
  const pathParts = path
    .replace(/^\.\//, "")
    .replace(/\.tsx$/, "")
    .replace(/index$/, "")
    .replace(/\/$/, "")
    .split("/")
    .filter((part) => part !== "pages" && part !== "src");

  return `/${pathParts.join("/")}`;
}
