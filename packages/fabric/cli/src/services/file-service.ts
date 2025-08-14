import type {
  JSONParsingError,
  Schema,
  SchemaParsingError,
} from "@fabric/core";
import {
  TaggedError,
  type Effect,
  type Infer,
  type UnexpectedError,
} from "@fabric/core";

export interface FileService {
  readJsonFile<TSchema extends Schema>(
    schema: TSchema,
    path: string,
  ): Effect<
    Infer<TSchema>,
    | UnexpectedError
    | FileReadError
    | JSONParsingError
    | SchemaParsingError<TSchema>
  >;

  openExplorerIn(path: string): Effect<void, UnexpectedError>;
}

export class FileReadError extends TaggedError<"FileReadError"> {
  constructor(message: string) {
    super("FileReadError", message);
  }
}
