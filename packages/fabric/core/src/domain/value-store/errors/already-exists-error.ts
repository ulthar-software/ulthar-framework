import { TaggedError } from "../../../error/tagged-error.js";

export class AlreadyExistsError extends TaggedError<"AlreadyExistsError"> {
  constructor() {
    super("AlreadyExistsError");
  }
}
