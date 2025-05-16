import type { UUID } from "@fabric/core";
import { TaggedError } from "@fabric/core";

export class ResourceNotFoundError extends TaggedError<"ResourceNotFoundError"> {
  constructor(public readonly resourceId: UUID) {
    super("ResourceNotFoundError");
    this.message = `Resource with ID ${resourceId} not found`;
  }
}
