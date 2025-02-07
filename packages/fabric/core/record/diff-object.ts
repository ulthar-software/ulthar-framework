export interface ObjectDiff<T extends object> {
  set: Partial<T>;
  remove: string[];
}

export function diffObject<const T extends object>(
  a: T,
  b: T,
) {
  const diff: ObjectDiff<T> = {
    set: {},
    remove: [],
  };

  for (const key in a) {
    if (!b[key]) {
      diff.remove.push(key);
    }
  }

  for (const key in b) {
    if (a[key] !== b[key]) {
      // deno-lint-ignore no-explicit-any
      (diff.set[key] as any) = b[key];
    }
  }

  return diff;
}
