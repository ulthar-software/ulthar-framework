/* eslint-disable @typescript-eslint/no-explicit-any */

import { TaggedError } from "@fabric/core";

export class StoreQueryError extends TaggedError<"StoreQueryError"> {
  constructor(
    public message: string,
    public context: any,
  ) {
    super("StoreQueryError");
  }
}
