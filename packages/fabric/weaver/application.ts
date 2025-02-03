import { Effect } from "@fabric/core";
import { addDevelopmentRebuildListeners } from "./builder/handle-rebuild.ts";
import { Renderer } from "./renderer/renderer.ts";

export interface ApplicationOptions<TModel, TDeps> {
  init: () => [
    TModel,
    Effect<TModel, never, TDeps> | undefined,
  ];

  dependencies: TDeps;

  defaultRoute: string;

  routes: Record<string, string>;
}

declare const renderer: Renderer;

let IS_APP_RUNNING = false;
export async function createApp<TModel, TDeps>(
  { init, routes, dependencies, defaultRoute }: ApplicationOptions<
    TModel,
    TDeps
  >,
): Promise<void> {
  if (IS_APP_RUNNING) throw new Error("Application already running");
  IS_APP_RUNNING = true;

  if (WEAVER_MODE === "dev") {
    addDevelopmentRebuildListeners();
  }

  const [appModel, appInitEffect] = init();

  const route = routes[defaultRoute]!;

  const module = await import(route);
  const [pageModel, pageInitEffect] = module.default.init(appModel);

  renderer.renderView(module.default.view({
    ...appModel,
    ...pageModel,
  }));

  if (appInitEffect) {
    const updatedAppModel = await appInitEffect.run(dependencies);
    if (pageInitEffect) {
      const updatedPageModel = await pageInitEffect.run(dependencies);
      renderer.updateView(module.default.view({
        ...updatedAppModel,
        ...updatedPageModel,
      }));
      return;
    }
    renderer.updateView(module.default.view(updatedAppModel));
    return;
  }

  if (pageInitEffect) {
    const updatedPageModel = await pageInitEffect.run(dependencies);
    renderer.updateView(module.default.view({
      ...appModel,
      ...updatedPageModel,
    }));

    return;
  }
}
