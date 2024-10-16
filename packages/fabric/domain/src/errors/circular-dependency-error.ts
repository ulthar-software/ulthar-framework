import { TaggedError } from "@fabric/core";

export class CircularDependencyError
  extends TaggedError<"CircularDependencyError"> {
  context: { key: string; dep: string };
  constructor(key: string, dep: string) {
    super("CircularDependencyError");
    this.context = { key, dep };
  }
}
