import type { Effect, UUID } from "@fabric/core";
import { Field, Model, UnexpectedError, type Infer } from "@fabric/core";
import { UnitAddedEvent } from "../../../../models/unit.js";
import { AccessPolicy } from "../../../../security/access-policy.js";
import { Permission } from "../../../../security/permission.js";
import type { UserAccess } from "../../../../services/auth-service.js";
import type { DomainCryptoService } from "../../../../services/crypto-service.js";
import type { DomainEventStore } from "../../../../services/event-store.js";
import type { DomainStateStore } from "../../../../services/state-store.js";
import { UseCase } from "../../../../utils/use-case.js";
import { ModuleNotFoundError } from "../../errors.js";

export interface AddUnitToModuleDependencies {
  state: DomainStateStore;
  events: DomainEventStore;
  crypto: DomainCryptoService;
  currentUser: UserAccess;
}

export const AddUnitToModuleInputModel = new Model("AddUnitToModuleInput", {
  moduleId: Field.uuid(),
  title: Field.string({
    minLength: 3,
  }),
});

export type AddUnitToModuleInput = Infer<typeof AddUnitToModuleInputModel>;

export interface AddUnitToModuleOutput {
  unitId: UUID;
}

export const AddUnitToModuleUseCase = new UseCase({
  name: "AddUnitToModule",
  type: "command",
  auth: AccessPolicy.WithPermission(Permission.EDIT_COURSE),
  inputSchema: AddUnitToModuleInputModel,
  effect: (
    { state, events, crypto, currentUser }: AddUnitToModuleDependencies,
    { moduleId, title }: AddUnitToModuleInput,
  ): Effect<AddUnitToModuleOutput, ModuleNotFoundError | UnexpectedError> => {
    return state
      .from("modules")
      .where({ id: moduleId })
      .selectOneOrFail()
      .mapError(() => new ModuleNotFoundError(moduleId))
      .flatMap(() => {
        // Get the count of existing units for this module to determine the order
        return state
          .from("units")
          .where({ moduleId })
          .count()
          .mapError(() => new UnexpectedError())
          .flatMap((count) => {
            const unitId = crypto.randomUUID();
            const eventId = crypto.randomUUID();
            const unitOrder = count * 100 + 100; // Set order to 100 more than last unit (maintains spacing of 100)

            const unitAddedEvent = UnitAddedEvent.from({
              id: eventId,
              streamId: unitId,
              payload: {
                title,
                moduleId,
                order: unitOrder,
                createdBy: currentUser.id,
              },
              version: 1n,
            });

            return events
              .append("units", unitAddedEvent)
              .map(() => ({ unitId }));
          });
      });
  },
});
