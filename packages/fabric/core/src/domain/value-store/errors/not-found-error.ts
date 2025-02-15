import { TaggedError } from "../../../error/tagged-error.js";

export class NotFoundError extends TaggedError<"NotFoundError"> {
  constructor() {
    super("NotFoundError");
  }
}
