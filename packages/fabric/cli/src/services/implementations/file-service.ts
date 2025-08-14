import type {
  Infer,
  JSONParsingError,
  Schema,
  SchemaParsingError,
} from "@fabric/core";
import { Effect, JSONExt, UnexpectedError } from "@fabric/core";
import fs from "fs/promises";
import { FileReadError, type FileService } from "../file-service.js";

import { spawn } from "node:child_process";
import os from "node:os";

export class FileServiceImplementation implements FileService {
  openExplorerIn(path: string): Effect<void, UnexpectedError> {
    return Effect.tryFrom(
      () => {
        switch (os.platform()) {
          case "win32":
            spawn("explorer", [path], { detached: true });
            break;
          case "darwin":
            spawn("open", [path], { detached: true });
            break;
          case "linux":
            spawn("xdg-open", [path], { detached: true });
            break;
        }
      },
      (err: Error) => new UnexpectedError(err.message),
    );
  }
  readJsonFile<TSchema extends Schema>(
    schema: TSchema,
    path: string,
  ): Effect<
    Infer<TSchema>,
    | UnexpectedError
    | FileReadError
    | JSONParsingError
    | SchemaParsingError<TSchema>
  > {
    return Effect.tryFrom(
      async () => await fs.readFile(path, "utf-8"),
      (err: Error) => new FileReadError(err.message),
    ).mapResult((data) => JSONExt.parseWithModel(schema, data));
  }
}
