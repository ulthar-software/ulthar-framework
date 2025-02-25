import type { JSONParsingError, SchemaParsingError } from "@fabric/core";
import {
  TaggedError,
  type Effect,
  type Model,
  type ModelToType,
  type UnexpectedError,
} from "@fabric/core";

export interface FileService {
  readJsonFile<TModel extends Model>(
    model: TModel,
    path: string,
  ): Effect<
    ModelToType<TModel>,
    | UnexpectedError
    | FileReadError
    | JSONParsingError
    | SchemaParsingError<TModel>
  >;

  openExplorerIn(path: string): Effect<void, UnexpectedError>;
}

export class FileReadError extends TaggedError<"FileReadError"> {
  constructor(message: string) {
    super("FileReadError", message);
  }
}
