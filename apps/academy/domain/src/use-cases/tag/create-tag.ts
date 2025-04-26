import type { Effect, UUID } from "@fabric/core";
import { Field, Schema, UnexpectedError, type Infer } from "@fabric/core";
import { TagCreatedEvent } from "../../models/tag.js";
import { AccessPolicy } from "../../security/access-policy.js";
import { Permission } from "../../security/permission.js";
import type { UserAccess } from "../../services/auth-service.js";
import type { DomainCryptoService } from "../../services/crypto-service.js";
import type { DomainEventStore } from "../../services/event-store.js";
import type { DomainStateStore } from "../../services/state-store.js";
import { UseCase } from "../../utils/use-case.js";
import { TagAlreadyExistsError } from "./errors.js";

export interface CreateTagDependencies {
  state: DomainStateStore;
  events: DomainEventStore;
  crypto: DomainCryptoService;
  currentUser: UserAccess;
}

export const CreateTagInputModel = new Schema({
  name: Field.string({
    minLength: 1,
  }),
});

export type CreateTagInput = Infer<typeof CreateTagInputModel>;

export interface CreateTagOutput {
  tagId: UUID;
}

export const CreateTagUseCase = new UseCase({
  name: "createTag",
  type: "command",
  auth: AccessPolicy.WithPermission(Permission.MANAGE_TAGS),
  inputSchema: CreateTagInputModel,
  effect: (
    { state, events, crypto, currentUser }: CreateTagDependencies,
    { name }: CreateTagInput,
  ): Effect<CreateTagOutput, TagAlreadyExistsError | UnexpectedError> => {
    // First check if a tag with this name already exists
    return state
      .from("tags")
      .where({ name })
      .assertNone()
      .errorMap(() => new TagAlreadyExistsError(name))
      .flatMap(() => {
        // Create a new tag
        const tagId = crypto.randomUUID();
        const eventId = crypto.randomUUID();

        const tagCreatedEvent = TagCreatedEvent.from({
          id: eventId,
          streamId: tagId,
          payload: {
            name,
            createdBy: currentUser.id,
          },
          version: 1,
        });

        // Append the event
        return events
          .append("tags", tagCreatedEvent)
          .mapError(() => new UnexpectedError("Failed to create tag"))
          .map(() => ({
            tagId,
          }));
      });
  },
});
