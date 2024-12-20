import { Result, TaggedError } from "@fabric/core";

export interface SortByDependenciesOptions<T> {
  keyGetter: (element: T) => string;
  depsGetter: (element: T) => string[];
}
/**
 * Sorts an array of elements based on their dependencies.
 */
export function sortByDependencies<T>(
  array: T[],
  {
    keyGetter,
    depsGetter,
  }: SortByDependenciesOptions<T>,
): Result<T[], CircularDependencyError> {
  const graph = new Map<string, string[]>();
  const visited = new Set<string>();
  const sorted: string[] = [];
  array.forEach((element) => {
    const key = keyGetter(element);
    const deps = depsGetter(element);
    graph.set(key, deps);
  });
  const visit = (key: string, ancestors: string[]) => {
    if (visited.has(key)) {
      return;
    }
    ancestors.push(key);
    const deps = graph.get(key) || [];
    deps.forEach((dep) => {
      if (ancestors.includes(dep)) {
        throw new CircularDependencyError(key, dep);
      }
      visit(dep, ancestors.slice());
    });
    visited.add(key);
    sorted.push(key);
  };
  return Result.tryFrom(
    () => {
      graph.forEach((_, key) => {
        visit(key, []);
      });
      return sorted.map(
        (key) => array.find((element) => keyGetter(element) === key) as T,
      );
    },
    (e) => e as CircularDependencyError,
  );
}

export class CircularDependencyError
  extends TaggedError<"CircularDependencyError"> {
  constructor(key: string, dep: string) {
    super("CircularDependencyError");
    this.message = `Circular dependency detected between ${key} and ${dep}`;
  }
}
