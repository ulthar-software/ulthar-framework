/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Effect, TaggedError } from "@fabric/core";

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
