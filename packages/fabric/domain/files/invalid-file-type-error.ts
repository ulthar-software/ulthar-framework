import { TaggedError } from "@fabric/core";

export class InvalidFileTypeError extends TaggedError<"InvalidFileTypeError"> {
  constructor() {
    super("InvalidFileTypeError");
  }
}
