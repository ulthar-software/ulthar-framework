import { Effect, TaggedVariant } from "@fabric/core";

export interface NavigationDependencies {
  navigate: (url: string) => void;
  replace: (url: string) => void;
}

export namespace Navigation {
  export const navigateTo = (to: string) =>
    Effect.from(({ navigate }: NavigationDependencies) => {
      navigate(to);
    });

  export const switchTo = (to: string) =>
    Effect.from(({ replace }: NavigationDependencies) => {
      replace(to);
    });
}

export function createApp(app: Application): void {
}

// deno-lint-ignore no-explicit-any
export interface Application<TModel = any> {
  init: (startURL: URL) => [
    TModel,
    Effect<TModel> | undefined,
  ];
}

export function getSessionFromStorage() {
}

export interface Route {
  path: string;
  page: Page;
}

export interface WeaverEvent<TTag extends string = string>
  extends TaggedVariant<TTag> {
}

export interface WeaverDocument {
  title: string;
  tags: string[];
  body: Component[];
}

// deno-lint-ignore no-explicit-any
export interface Page<TModel = any> {
  init: () => Effect<TModel>;

  subscriptions: (model: TModel) => WeaverEvent;

  update: (msg: WeaverEvent, model: TModel) => TModel;

  view: (model: TModel) => WeaverDocument;
}

// deno-lint-ignore no-explicit-any
export interface Component<TModel = any> {
  init: (startURL: URL) => {
    model: TModel;
    msg: WeaverEvent;
  };

  view: (model: TModel) => WeaverElement[];
}

export interface WeaverElement {
  tag: string;
  attrs: Record<string, string>;
  children: WeaverElement[];
}

export function a(
  attrs: Record<string, string>,
  children: WeaverElement[],
): WeaverElement {
  return { tag: "a", attrs, children };
}
