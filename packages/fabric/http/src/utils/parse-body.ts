import type { JSONParsingError } from "@fabric/core";
import { Effect, JSONExt, Result, TaggedError } from "@fabric/core";
import type { IncomingMessage } from "node:http";
import { searchParamsToObject } from "./search-params-to-object.js";

export function parseBody(
  req: IncomingMessage,
): Effect<object | string, BodyParseError | JSONParsingError> {
  return Effect.tryFrom(
    () =>
      new Promise<string>((resolve, reject) => {
        let body = "";
        req
          .on("data", (chunk: Buffer) => {
            body += chunk.toString();
          })
          .on("end", () => {
            resolve(body);
          })
          .on("error", (err) => {
            reject(err);
          });
      }),
    (error: Error) => new BodyParseError(error.message),
  ).mapResult((bodyString): Result<object | string, JSONParsingError> => {
    switch (req.headers["content-type"]) {
      case "application/json":
        return JSONExt.parse<object>(bodyString);
      case "application/x-www-form-urlencoded":
        return Result.ok(searchParamsToObject(new URLSearchParams(bodyString)));
      case "text/plain": // handle plain text case
      default:
        return Result.ok(bodyString);
    }
  });
}

export class BodyParseError extends TaggedError<"BodyParseError"> {
  constructor(message?: string) {
    super("BodyParseError", message);
  }
}
