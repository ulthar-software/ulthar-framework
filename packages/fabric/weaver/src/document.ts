/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TaggedError } from "@fabric/core";
import type { WeaverElement } from "./renderer/element.js";

export interface WeaverDocument<
  TModel = any,
  TError extends TaggedError = never,
  TDependencies = any,
> {
  title: string;
  meta: Record<string, string>;
  body: WeaverElement<TModel, TError, TDependencies>[];
}
