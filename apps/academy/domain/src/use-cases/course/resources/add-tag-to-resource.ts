import type { Infer, UnexpectedError } from "@fabric/core";
import { Effect, Field, Schema } from "@fabric/core";
import { ResourceTagCreatedEvent } from "../../../models/resource-tag.js";
import { AccessPolicy } from "../../../security/access-policy.js";
import { Permission } from "../../../security/permission.js";
import type { UserAccess } from "../../../services/auth-service.js";
import type { DomainCryptoService } from "../../../services/crypto-service.js";
import type { DomainEventStore } from "../../../services/event-store.js";
import type { DomainStateStore } from "../../../services/state-store.js";
import { UseCase } from "../../../utils/use-case.js";
import { TagNotFoundError } from "../../tag/errors.js";
import { ResourceNotFoundError } from "./errors.js";

export interface AddTagToResourceDependencies {
  state: DomainStateStore;
  events: DomainEventStore;
  crypto: DomainCryptoService;
  currentUser: UserAccess;
}

export const AddTagToResourceInputModel = new Schema({
  resourceId: Field.uuid(),
  tagId: Field.uuid(),
});
export type AddTagToResourceInput = Infer<typeof AddTagToResourceInputModel>;

export interface AddTagToResourceOutput {
  ok: boolean;
}

export const AddTagToResourceUseCase = new UseCase({
  auth: AccessPolicy.WithPermission(Permission.EDIT_COURSE),
  name: "addTagToResource",
  type: "command",
  inputSchema: AddTagToResourceInputModel,
  effect: (
    { state, events, crypto, currentUser }: AddTagToResourceDependencies,
    { resourceId, tagId }: AddTagToResourceInput,
  ): Effect<
    void,
    ResourceNotFoundError | TagNotFoundError | UnexpectedError
  > => {
    return Effect.fromGen(function* () {
      yield* state
        .from("resources")
        .where({ id: resourceId })
        .selectOneOrFail()
        .mapError(() => new ResourceNotFoundError(resourceId));
      yield* state
        .from("tags")
        .where({ id: tagId })
        .selectOneOrFail()
        .mapError(() => new TagNotFoundError(tagId));

      yield* events.append(
        "resourceTags",
        ResourceTagCreatedEvent.from({
          id: crypto.randomUUID(),
          streamId: crypto.randomUUID(),
          payload: {
            resourceId,
            tagId,
            createdBy: currentUser.id,
          },
          version: 1,
        }),
      );
    });
  },
});
