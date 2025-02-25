/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createServer } from "node:http";
import type { HttpMethod } from "./http-method.js";
import type {
  HttpRoute,
  HttpRouteMap,
  HttpRoutesGroupedByMethod,
} from "./http-route.js";
import { handleRequest } from "./utils/handle-request.js";

export interface ServerOptions {
  port: number;
  routes: HttpRoute[];
}

export interface Server {
  close: () => void;
}

export function startServer(options: ServerOptions): Server {
  const port = options.port;
  const routes = options.routes.reduce<HttpRoutesGroupedByMethod>(
    (acc, route) => {
      if (!acc[route.method]) {
        acc[route.method] = {} as HttpRouteMap;
      }
      acc[route.method]![route.path] = route.handler;
      return acc;
    },
    {},
  );

  const server = createServer((req, res) => {
    const route = routes[req.method as HttpMethod]?.[req.url!];

    if (!route) {
      void 0; //Ignore a request that doesn't match any route
      return;
    }
    void handleRequest(req, res, route);
  });

  server.listen(port);

  return {
    close: () => server.close(),
  };
}
