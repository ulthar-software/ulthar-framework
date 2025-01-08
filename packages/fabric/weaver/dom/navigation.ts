export const NavigationDependencies = {
  navigate: (url: string) => {
    globalThis.history.pushState({}, "", url);
  },
  replace: (url: string) => {
    globalThis.history.replaceState({}, "", url);
  },
};
