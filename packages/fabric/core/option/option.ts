// deno-lint-ignore-file no-explicit-any
/**
 * An `Option` type is a type that represents a value that may or may not be present.
 */
export class Option<T> {
  static some<T>(value: T): Option<T> {
    return new Option(value);
  }

  static none<T>(): Option<T> {
    return new Option(null) as any;
  }

  static from<T>(value: T | null | undefined): Option<T> {
    return value === null || value === undefined
      ? Option.none()
      : Option.some(value);
  }

  private constructor(readonly value: T | null) {}

  isValue(): this is { value: T } {
    return this.value !== null;
  }

  isNothing(): this is { value: null } {
    return this.value === null;
  }

  map<U>(fn: (value: T) => U): Option<U> {
    return this.isValue() ? new Option(fn(this.value)) : this as any;
  }

  flatMap<U>(fn: (value: T) => Option<U>): Option<U> {
    return this.isValue() ? fn(this.value) : this as any;
  }

  match<K, U>(matcher: OptionalMatcher<T, K, U>): K | U {
    return this.isValue() ? matcher.some(this.value) : matcher.none();
  }
}

type OptionalMatcher<T, K, U> = {
  some: (value: T) => K;
  none: () => U;
};
