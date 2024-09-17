/* eslint-disable @typescript-eslint/no-explicit-any */
import { TaggedError } from "../../error/tagged-error.js";

export class StoreQueryError extends TaggedError<"StoreQueryError"> {
  constructor(
    public message: string,
    public context: any,
  ) {
    super("StoreQueryError");
  }
}
