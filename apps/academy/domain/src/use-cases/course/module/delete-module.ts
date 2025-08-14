import type { CryptoService, Effect, UnexpectedError } from "@fabric/core";
import { Field, Schema, type Infer } from "@fabric/core";
import { ModuleDeletedEvent } from "../../../models/module.js";
import { AccessPolicy } from "../../../security/access-policy.js";
import { Permission } from "../../../security/permission.js";
import type { UserAccess } from "../../../services/auth-service.js";
import type { DomainEventStore } from "../../../services/event-store.js";
import type { DomainStateStore } from "../../../services/state-store.js";
import { UseCase } from "../../../utils/use-case.js";
import { ModuleNotFoundError } from "../errors.js";

export interface DeleteModuleDependencies {
  state: DomainStateStore;
  events: DomainEventStore;
  crypto: CryptoService;
  currentUser: UserAccess;
}

export const DeleteModuleInputModel = new Schema({
  moduleId: Field.uuid(),
});

export type DeleteModuleInput = Infer<typeof DeleteModuleInputModel>;

export const DeleteModuleUseCase = new UseCase({
  name: "deleteModule",
  type: "command",
  auth: AccessPolicy.WithPermission(Permission.EDIT_COURSE),
  inputSchema: DeleteModuleInputModel,
  effect: (
    { state, events, crypto }: DeleteModuleDependencies,
    { moduleId }: DeleteModuleInput,
  ): Effect<void, ModuleNotFoundError | UnexpectedError> => {
    return state
      .from("modules")
      .where({ id: moduleId })
      .selectOneOrFail()
      .mapError(() => new ModuleNotFoundError(moduleId))
      .flatMap((module) => {
        const eventId = crypto.randomUUID();

        const moduleDeletedEvent = ModuleDeletedEvent.from({
          id: eventId,
          streamId: moduleId,
          payload: {},
          version: module.version + 1, // Increment the version
        });

        return events.append("modules", moduleDeletedEvent).discardValue();
      });
  },
});
