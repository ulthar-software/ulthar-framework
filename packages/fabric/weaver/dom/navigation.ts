export const NavigationDependencies = {
  navigate: (url: string) => {
    window.history.pushState({}, "", url);
  },
  replace: (url: string) => {
    window.history.replaceState({}, "", url);
  },
};
