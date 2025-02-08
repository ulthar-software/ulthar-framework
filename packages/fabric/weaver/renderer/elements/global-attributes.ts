// deno-lint-ignore-file no-explicit-any
import { Effect, TaggedError } from "../../../core/index.ts";

export interface GlobalAttributes<
  TModel = any,
  TError extends TaggedError = never,
  TDependencies = any,
> {
  class?: string;
  id?: string;
  draggable?: boolean;
  title?: string;
  role?: string;
  popover?: string;
  hidden?: boolean;

  //Events
  onClick?: (evt: MouseEvent) => Effect<TModel, TError, Partial<TDependencies>>;
}
