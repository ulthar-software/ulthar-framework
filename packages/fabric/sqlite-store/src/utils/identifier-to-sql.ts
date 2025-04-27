export function identifierToSQL(name: string) {
  return name
    .split(".")
    .map((part) => `\`${part}\``)
    .join(".");
}
