import type { Effect, TaggedError } from "@fabric/core";
import type { HttpMethod } from "./http-method.js";
import type { HttpRequest } from "./http-request.js";
import type { HttpResponse } from "./http-response.js";

export interface HttpRoute {
  method: HttpMethod;
  path: string;
  handler: Handler;
}

export type Handler = (req: HttpRequest) => Effect<HttpResponse, TaggedError>;

export type HttpRoutesGroupedByMethod = Partial<
  Record<HttpMethod, HttpRouteMap>
>;

export type HttpRouteMap = Partial<Record<string, Handler>>;
