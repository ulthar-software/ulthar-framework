import { JSONExt, Result, TaggedError } from "@fabric/core";

export function decodeJWT<T>(token: string): Result<T, JWTDecodeError> {
  return transformTokenToJsonString(token)
    .flatMap(JSONExt.parse<T>)
    .errorMap((error) =>
      error._tag == "JSONParsingError"
        ? new JWTDecodeError("Malformed Payload")
        : error,
    );
}

export class JWTDecodeError extends TaggedError<"JWTDecodeError"> {
  constructor(message?: string) {
    super("JWTDecodeError", message);
  }
}

function transformTokenToJsonString(
  token: string,
): Result<string, JWTDecodeError> {
  return Result.tryFrom(
    () => {
      return atob(token.split(".")[1]);
    },
    () => {
      return new JWTDecodeError("Malformed base64 string");
    },
  );
}
