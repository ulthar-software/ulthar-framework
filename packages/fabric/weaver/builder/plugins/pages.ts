import type { Plugin } from "esbuild";
import fs from "node:fs";
import type { RoutePath, RoutesDefinition } from "../../routing/route-path.ts";

export const pagesPlugin = (routes: RoutesDefinition) => ({
  name: "pages",
  setup(build) {
    build.onLoad(
      { filter: /routes.ts$/, namespace: "file" },
      () => {
        const transformedRoutes = routesToJsExtension(transformRoutes(routes));
        return {
          contents: `export default ${JSON.stringify(transformedRoutes)};`,
          loader: "js",
        };
      },
    );
  },
} as Plugin);

export function transformRoutes(
  routes: RoutesDefinition,
): RoutesDefinition {
  return Object.entries(routes).reduce((acc, [route, path]) => {
    const indexPath = `src/pages${path.slice(1)}/index.ts`;
    const directPath = `src/pages/${path.slice(1)}.ts`;

    if (fs.existsSync(indexPath)) {
      acc[route!] = indexPath as RoutePath;
      return acc;
    }

    if (fs.existsSync(directPath)) {
      acc[route!] = indexPath as RoutePath;
      return acc;
    }

    throw new Error(`Could not find file for route ${route} at ${path}`);
  }, {} as RoutesDefinition);
}

export function routesToJsExtension(
  routes: RoutesDefinition,
): RoutesDefinition {
  return Object.entries(routes).reduce((acc, [route, path]) => {
    acc[route!] = "/" + path?.slice(4).replace(".ts", ".js") as RoutePath;
    return acc;
  }, {} as RoutesDefinition);
}

export interface RouteToPathOptions {
  pagesRootDir?: string;
}

export function convertRouteToPath(
  route: string,
  opts: RouteToPathOptions,
): {
  indexPath: string;
  directPath: string;
} {
  opts = {
    pagesRootDir: "src/pages",
    ...opts,
  };
  return {
    indexPath: `${opts.pagesRootDir}/${route}/index.ts`,
    directPath: `${opts.pagesRootDir}/${route}.ts`,
  };
}
