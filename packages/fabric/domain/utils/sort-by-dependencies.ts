import { Result } from "@fabric/core";
import { CircularDependencyError } from "../errors/circular-dependency-error.ts";

export function sortByDependencies<T>(
  array: T[],
  {
    keyGetter,
    depGetter,
  }: {
    keyGetter: (element: T) => string;
    depGetter: (element: T) => string[];
  },
): Result<T[], CircularDependencyError> {
  const graph = new Map<string, string[]>();
  const visited = new Set<string>();
  const sorted: string[] = [];
  array.forEach((element) => {
    const key = keyGetter(element);
    const deps = depGetter(element);
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
