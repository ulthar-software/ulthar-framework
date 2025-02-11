/* eslint-disable @typescript-eslint/no-misused-spread */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/naming-convention */
import type { Effect } from "@fabric/core";
import { addDevelopmentRebuildListeners } from "./builder/handle-rebuild.js";
import { HTMLRenderer } from "./renderer/dom/html-renderer.js";

export interface DefaultDependencies {
  window: Window;
  document: Document;
  env: {
    WEAVER_MODE: string;
  };
}

export interface ApplicationOptions<TModel, TDeps> {
  init: () => [TModel, Effect<TModel, never, TDeps> | undefined];

  dependencies: TDeps & DefaultDependencies;

  defaultRoute: string;

  routes: Record<string, string>;
}

let IS_APP_RUNNING = false;
export async function createApp<TModel, TDeps>({
  init,
  routes,
  dependencies,
  defaultRoute,
}: ApplicationOptions<TModel, TDeps>): Promise<void> {
  if (IS_APP_RUNNING) throw new Error("Application already running");
  IS_APP_RUNNING = true;

  if (WEAVER_MODE === "dev") {
    addDevelopmentRebuildListeners();
  }

  function registerEffect() {
    //TODO: Implement
  }

  const renderer = new HTMLRenderer(dependencies.document, registerEffect);

  const [appModel, appInitEffect] = init();

  const route = routes[defaultRoute];

  const page = (await import(route)).default;

  const initResult = page.init?.(appModel);

  const [pageModel, pageInitEffect] = initResult || [{}, undefined];

  renderer.renderView(
    page.view({
      ...appModel,
      ...pageModel,
    }),
  );

  if (appInitEffect) {
    const updatedAppModel = await appInitEffect.run(dependencies);
    if (pageInitEffect) {
      const updatedPageModel = await pageInitEffect.run(dependencies);
      renderer.renderView(
        page.view({
          ...updatedAppModel,
          ...updatedPageModel,
        }),
      );
      return;
    }
    renderer.renderView(page.view(updatedAppModel));
    return;
  }

  if (pageInitEffect) {
    const updatedPageModel = await pageInitEffect.run(dependencies);
    renderer.renderView(
      page.view({
        ...appModel,
        ...updatedPageModel,
      }),
    );

    return;
  }
}
