import { createBrowserRouter } from "react-router";
import {
  generateRoutes,
  type LazyPage,
} from "./utils/routing/generate-routes.ts";

const dynamicPages = import.meta.glob([
  "./pages/**/*.tsx",
  "!./pages/**/*.stories.tsx",
]) as Record<string, LazyPage>;

const routes = generateRoutes(dynamicPages);

export const router = createBrowserRouter(routes);
