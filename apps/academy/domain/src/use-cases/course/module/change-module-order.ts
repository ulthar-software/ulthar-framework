import type { CryptoService, Effect, UnexpectedError } from "@fabric/core";
import { Field, Schema, type Infer } from "@fabric/core";
import { ModuleOrderChangedEvent } from "../../../models/module.js";
import { AccessPolicy } from "../../../security/access-policy.js";
import { Permission } from "../../../security/permission.js";
import type { UserAccess } from "../../../services/auth-service.js";
import type { DomainEventStore } from "../../../services/event-store.js";
import type { DomainStateStore } from "../../../services/state-store.js";
import { UseCase } from "../../../utils/use-case.js";
import { ModuleNotFoundError } from "../errors.js";

export interface ChangeModuleOrderDependencies {
  state: DomainStateStore;
  events: DomainEventStore;
  crypto: CryptoService;
  currentUser: UserAccess;
}

export const ChangeModuleOrderInputModel = new Schema({
  moduleId: Field.uuid(),
  order: Field.integer({
    isUnsigned: true,
    hasArbitraryPrecision: false,
  }),
});

export type ChangeModuleOrderInput = Infer<typeof ChangeModuleOrderInputModel>;

export const ChangeModuleOrderUseCase = new UseCase({
  name: "changeModuleOrder",
  type: "command",
  auth: AccessPolicy.WithPermission(Permission.EDIT_COURSE),
  inputSchema: ChangeModuleOrderInputModel,
  effect: (
    { state, events, crypto, currentUser }: ChangeModuleOrderDependencies,
    { moduleId, order }: ChangeModuleOrderInput,
  ): Effect<void, ModuleNotFoundError | UnexpectedError> => {
    return state
      .from("modules")
      .where({ id: moduleId })
      .selectOneOrFail()
      .mapError(() => new ModuleNotFoundError(moduleId))
      .flatMap((module) => {
        const eventId = crypto.randomUUID();

        const moduleOrderChangedEvent = ModuleOrderChangedEvent.from({
          id: eventId,
          streamId: moduleId,
          payload: {
            order,
            updatedBy: currentUser.id,
          },
          version: module.version + 1, // Increment the version
        });

        return events.append("modules", moduleOrderChangedEvent).discardValue();
      });
  },
});
