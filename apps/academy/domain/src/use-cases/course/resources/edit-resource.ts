import type { CryptoService, Infer, UnexpectedError, UUID } from "@fabric/core";
import { Effect, Field, Schema } from "@fabric/core";
import { ResourceEditedEvent } from "../../../models/resource.js";
import { AccessPolicy } from "../../../security/access-policy.js";
import { Permission } from "../../../security/permission.js";
import type { UserAccess } from "../../../services/auth-service.js";
import type { DomainEventStore } from "../../../services/event-store.js";
import type { DomainStateStore } from "../../../services/state-store.js";
import { UseCase } from "../../../utils/use-case.js";
import { ResourceNotFoundError } from "./errors.js";

export interface EditResourceDependencies {
  state: DomainStateStore;
  events: DomainEventStore;
  crypto: CryptoService;
  currentUser: UserAccess;
}

export const EditResourceInputModel = new Schema({
  resourceId: Field.uuid(),
  title: Field.string(),
  description: Field.string(),
  url: Field.string(),
});

export type EditResourceInput = Infer<typeof EditResourceInputModel>;

export interface EditResourceOutput {
  resourceId: UUID;
}

export const EditResourceUseCase = new UseCase({
  auth: AccessPolicy.WithPermission(Permission.EDIT_COURSE),
  name: "editResource",
  type: "command",
  inputSchema: EditResourceInputModel,
  effect: (
    { state, events, crypto, currentUser }: EditResourceDependencies,
    payload: EditResourceInput,
  ): Effect<EditResourceOutput, ResourceNotFoundError | UnexpectedError> => {
    return Effect.fromGen(function* () {
      const { resourceId, title, description, url } = payload;

      // Check if the resource exists
      const resource = yield* state
        .from("resources")
        .where({ id: resourceId })
        .selectOneOrFail()
        .mapError(() => new ResourceNotFoundError(resourceId));

      // Create resource edited event
      const resourceEditedEvent = ResourceEditedEvent.from({
        id: crypto.randomUUID(),
        streamId: resourceId,
        payload: {
          title,
          description,
          url,
          updatedBy: currentUser.id,
        },
        version: resource.version + 1, // Increment the version
      });

      // Store the resource edit event in the event store
      yield* events.append("resources", resourceEditedEvent);

      return { resourceId };
    });
  },
});
