import { Effect } from "@fabric/core";
import { WeaverDocument } from "./document.ts";

// deno-lint-ignore no-explicit-any
export interface Page<TModel = any> {
  init?: () => Effect<TModel> | TModel;

  view: (model: TModel) => WeaverDocument;
}
