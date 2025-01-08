// deno-lint-ignore-file no-explicit-any ban-types
export function h1(attrs: {}, ...children: any[]) {
  return {
    tag: "h1",
    attrs,
    children,
  };
}
