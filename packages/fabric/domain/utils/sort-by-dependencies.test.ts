import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { CircularDependencyError } from "../errors/circular-dependency-error.ts";
import { sortByDependencies } from "./sort-by-dependencies.ts";

describe("sortByDependencies", () => {
  it("should sort an array of objects by their dependencies", () => {
    const array = [
      { id: 1, name: "A", dependencies: ["C", "D"] },
      { id: 2, name: "B", dependencies: ["A", "D"] },
      { id: 3, name: "C", dependencies: [] },
      { id: 4, name: "D", dependencies: [] },
    ];

    const result = sortByDependencies(array, {
      keyGetter: (element) => element.name,
      depGetter: (element) => element.dependencies,
    }).unwrapOrThrow();

    expect(result).toEqual([
      { id: 3, name: "C", dependencies: [] },
      { id: 4, name: "D", dependencies: [] },
      { id: 1, name: "A", dependencies: ["C", "D"] },
      { id: 2, name: "B", dependencies: ["A", "D"] },
    ]);
  });

  it("should throw a CircularDependencyError when circular dependencies are detected", () => {
    const array = [
      { id: 1, name: "A", dependencies: ["B"] },
      { id: 2, name: "B", dependencies: ["A"] },
    ];

    expect(
      sortByDependencies(array, {
        keyGetter: (element) => element.name,
        depGetter: (element) => element.dependencies,
      }).unwrapErrorOrThrow(),
    ).toBeInstanceOf(CircularDependencyError);
  });

  it("should return an empty array when the input array is empty", () => {
    // deno-lint-ignore no-explicit-any
    const array: any[] = [];

    const result = sortByDependencies(array, {
      keyGetter: (element) => element.name,
      depGetter: (element) => element.dependencies,
    }).unwrapOrThrow();

    expect(result).toEqual([]);
  });
});
