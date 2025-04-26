/* eslint-disable @typescript-eslint/no-explicit-any */
import { TaggedError } from "../../../error/tagged-error.js";

export class StoreQueryError extends TaggedError<"StoreQueryError"> {
  constructor(
    message: string,
    readonly statement: string,
    readonly params?: Record<string, any>,
  ) {
    super("StoreQueryError", message);
  }

  toString(): string {
    return `StoreQueryError: ${this.message} (statement: ${this.statement}, params: ${JSON.stringify(
      this.params,
    )})`;
  }
}
