import { TaggedError } from "@fabric/core";

export class AlreadyExistsError extends TaggedError<"AlreadyExistsError"> {
  constructor() {
    super("AlreadyExistsError");
  }
}
