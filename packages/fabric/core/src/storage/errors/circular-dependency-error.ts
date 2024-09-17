import { TaggedError } from "../../error/tagged-error.js";

export class CircularDependencyError extends TaggedError<"CircularDependencyError"> {
  context: { key: string; dep: string };
  constructor(key: string, dep: string) {
    super("CircularDependencyError");
    this.context = { key, dep };
  }
}
