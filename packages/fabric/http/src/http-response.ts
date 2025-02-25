import type { JSONStringifyError, TaggedError } from "@fabric/core";
import { Effect, JSONExt } from "@fabric/core";
import type { OutgoingHttpHeaders } from "node:http";

export interface HttpResponse {
  readonly statusCode: number;
  readonly headers: OutgoingHttpHeaders;
  readonly body: string;
}

export namespace HttpResponse {
  export function ok(body: unknown): Effect<HttpResponse, JSONStringifyError> {
    return Effect.fromResult(() =>
      JSONExt.stringify(body).map((body) => ({
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body,
      })),
    );
  }

  export function okHtml(body: string): Effect<HttpResponse> {
    return Effect.from(() => ({
      statusCode: 200,
      headers: { "Content-Type": "text/html" },
      body,
    }));
  }

  export function internalError(
    error: TaggedError,
  ): Effect<HttpResponse, JSONStringifyError> {
    return Effect.fromResult(() =>
      JSONExt.stringify(error).map((body) => ({
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body,
      })),
    );
  }

  export function redirect(location: string): Effect<HttpResponse> {
    return Effect.from(() => ({
      statusCode: 301,
      headers: {
        Location: location,
      },
      body: "",
    }));
  }
}
