// deno-lint-ignore-file no-explicit-any
import { TaggedError } from "../core/index.ts";
import { WeaverElement } from "./renderer/element.ts";

export interface WeaverDocument<
  TModel = any,
  TError extends TaggedError = never,
  TDependencies = any,
> {
  title: string;
  meta: Record<string, string>;
  body: WeaverElement<TModel, TError, TDependencies>[];
}
