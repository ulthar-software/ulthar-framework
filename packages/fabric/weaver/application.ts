import { Effect } from "@fabric/core";
import { addDevelopmentRebuildListeners } from "./builder/handle-rebuild.ts";
import { renderDocument } from "./dom/rendering.ts";
import { WeaverEnv } from "./weaver-env.ts";

export interface ApplicationOptions<TModel, TDeps, TEnv> {
  init: (startURL: URL) => [
    TModel,
    Effect<TModel, never, TDeps> | undefined,
  ];

  env: WeaverEnv & TEnv;

  defaultRoute: string;

  routes: Record<string, string>;
}

let IS_APP_RUNNING = false;
export function createApp<TModel, TDeps, TEnv>(
  { init, routes, env, defaultRoute }: ApplicationOptions<TModel, TDeps, TEnv>,
): void {
  if (IS_APP_RUNNING) throw new Error("Application already running");
  IS_APP_RUNNING = true;

  if (WEAVER_MODE === "dev") {
    addDevelopmentRebuildListeners();
  }

  const route = routes[defaultRoute]!;

  import(route).then((module) => {
    renderDocument(module.default.view());
  });
}
