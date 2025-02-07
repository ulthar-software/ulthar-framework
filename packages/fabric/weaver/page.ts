// deno-lint-ignore-file no-explicit-any
import { Effect, TaggedError } from "@fabric/core";
import { WeaverDocument } from "./document.ts";

export interface Page<
  TModel = any,
  TError extends TaggedError = never,
  TDependencies = any,
> {
  init?: () => Effect<TModel, TError, TDependencies> | TModel;

  view: (model: TModel) => WeaverDocument<TModel, TError, TDependencies>;
}
