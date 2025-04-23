import type { Effect, UnexpectedError } from "@fabric/core";
import { Field, Schema, type Infer } from "@fabric/core";
import { ModuleTitleChangedEvent } from "../../../models/module.js";
import { AccessPolicy } from "../../../security/access-policy.js";
import { Permission } from "../../../security/permission.js";
import type { UserAccess } from "../../../services/auth-service.js";
import type { DomainCryptoService } from "../../../services/crypto-service.js";
import type { DomainEventStore } from "../../../services/event-store.js";
import type { DomainStateStore } from "../../../services/state-store.js";
import { UseCase } from "../../../utils/use-case.js";
import { ModuleNotFoundError } from "../errors.js";

export interface ChangeModuleTitleDependencies {
  state: DomainStateStore;
  events: DomainEventStore;
  crypto: DomainCryptoService;
  currentUser: UserAccess;
}

export const ChangeModuleTitleInputModel = new Schema({
  moduleId: Field.uuid(),
  title: Field.string({
    minLength: 3,
  }),
});

export type ChangeModuleTitleInput = Infer<typeof ChangeModuleTitleInputModel>;

export const ChangeModuleTitleUseCase = new UseCase({
  name: "changeModuleTitle",
  type: "command",
  auth: AccessPolicy.WithPermission(Permission.EDIT_COURSE),
  inputSchema: ChangeModuleTitleInputModel,
  effect: (
    { state, events, crypto, currentUser }: ChangeModuleTitleDependencies,
    { moduleId, title }: ChangeModuleTitleInput,
  ): Effect<void, ModuleNotFoundError | UnexpectedError> => {
    return state
      .from("modules")
      .where({ id: moduleId })
      .selectOneOrFail()
      .mapError(() => new ModuleNotFoundError(moduleId))
      .flatMap((module) => {
        const eventId = crypto.randomUUID();

        const moduleTitleChangedEvent = ModuleTitleChangedEvent.from({
          id: eventId,
          streamId: moduleId,
          payload: {
            title,
            updatedBy: currentUser.id,
          },
          version: module.version + 1n, // Increment the version
        });

        return events.append("modules", moduleTitleChangedEvent).discardValue();
      });
  },
});
