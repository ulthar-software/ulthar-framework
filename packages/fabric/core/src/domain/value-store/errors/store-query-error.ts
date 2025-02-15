import { TaggedError } from "../../../error/tagged-error.js";

export class StoreQueryError extends TaggedError<"StoreQueryError"> {
  constructor(message: string) {
    super("StoreQueryError", message);
  }
}
