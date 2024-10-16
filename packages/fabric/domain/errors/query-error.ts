import { TaggedError } from "@fabric/core";

export class StoreQueryError extends TaggedError<"StoreQueryError"> {
  constructor(message: string) {
    super("StoreQueryError", message);
  }
}
