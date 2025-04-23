export function clx(...classNames: unknown[]): string {
  return (
    classNames.filter(
      (className) => typeof className === "string" && className.length > 0,
    ) as string[]
  )
    .map((className) => className.trim())
    .join(" ");
}
