import type React from "react";
import type { RouteObject } from "react-router";
import { generatePath } from "./generate-path.ts";

export type LazyPage = () => Promise<{
  default: React.ComponentType;
}>;

export function generateRoutes(
  routes: Record<string, LazyPage>,
): RouteObject[] {
  return [
    ...Object.entries(routes).map(([path, page]: [string, LazyPage]) => ({
      path: generatePath(path),
      lazy: () =>
        page().then((module) => ({
          Component: module.default,
        })),
    })),
  ];
}
