import { Effect } from "@fabric/core";

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
