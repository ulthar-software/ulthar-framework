import { Effect } from "@fabric/core";
import { Page } from "./page.ts";

export function createApp<TModel, TDeps>(
  { init, routes }: ApplicationOptions<TModel, TDeps>,
): void {
  const [model, effect] = init(new URL(location.href));

  const currentPath = location.pathname;

  const route = routes[currentPath];

  if (route) {
    route().then((module) => {
      console.log(module.default.view(model));
    });
  }
}

// deno-lint-ignore no-explicit-any
export interface ApplicationOptions<TModel = any, TDeps = any> {
  init: (startURL: URL) => [
    TModel,
    Effect<TModel, never, TDeps> | undefined,
  ];

  routes: Record<string, () => Promise<{ default: Page }>>;

  homePage: Page;
}
