import { TaggedError } from "@fabric/core";

export class TagAlreadyExistsError extends TaggedError<"TagAlreadyExistsError"> {
  constructor(public readonly tagName: string) {
    super(
      "TagAlreadyExistsError",
      `A tag with the name '${tagName}' already exists`,
    );
  }
}

export class TagNotFoundError extends TaggedError<"TagNotFoundError"> {
  constructor(public readonly tagId: string) {
    super("TagNotFoundError", `Tag with ID '${tagId}' not found`);
  }
}
