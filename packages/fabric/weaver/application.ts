import { Effect } from "@fabric/core";

export function createApp<TModel, TDeps>(
  opts: ApplicationOptions<TModel, TDeps>,
): void {
  const [model, effect] = opts.init(new URL(location.href));
}

// deno-lint-ignore no-explicit-any
export interface ApplicationOptions<TModel = any, TDeps = any> {
  init: (startURL: URL) => [
    TModel,
    Effect<TModel, never, TDeps> | undefined,
  ];
}
