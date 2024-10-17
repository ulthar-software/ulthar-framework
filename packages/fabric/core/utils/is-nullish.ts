export function isNullish(value: unknown): value is null | undefined {
  return isNull(value) || isUndefined(value);
}

export function isUndefined(value: unknown): value is undefined {
  return value === undefined;
}

export function isNull(value: unknown): value is null {
  return value === null;
}
