import { TaggedError } from "@fabric/core";

export class NotFoundError extends TaggedError<"NotFoundError"> {
  constructor() {
    super("NotFoundError");
  }
}
