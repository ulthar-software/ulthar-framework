// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function exhaustiveCheck(value: never): never {
  throw new Error("Exhaustive check failed");
}
