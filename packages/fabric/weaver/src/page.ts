/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Effect, TaggedError } from "@fabric/core";
import type { WeaverDocument } from "./document.js";

export interface Page<
  TModel = any,
  TError extends TaggedError = never,
  TDependencies = any,
> {
  init?: () => Effect<TModel, TError, TDependencies> | TModel;

  view: (model: TModel) => WeaverDocument<TModel, TError, TDependencies>;
}
