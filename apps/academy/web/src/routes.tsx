import { createBrowserRouter } from "react-router";
import {
  generateRoutes,
  type LazyPage,
} from "./utils/routing/generate-routes.ts";

const dynamicPages = import.meta.glob("./pages/**/*.{tsx,ts}") as Record<
  string,
  LazyPage
>;

const routes = generateRoutes(dynamicPages);

console.log(routes);

export const router = createBrowserRouter(routes);
