import { TaggedError } from "../../../error/tagged-error.js";

export class InvalidFileTypeError extends TaggedError<"InvalidFileTypeError"> {
  constructor() {
    super("InvalidFileTypeError");
  }
}
