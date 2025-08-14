import type { CryptoService, Effect, UnexpectedError } from "@fabric/core";
import { Field, Schema, type Infer } from "@fabric/core";
import { UnitDeletedEvent } from "../../../../models/unit.js";
import { AccessPolicy } from "../../../../security/access-policy.js";
import { Permission } from "../../../../security/permission.js";
import type { UserAccess } from "../../../../services/auth-service.js";
import type { DomainEventStore } from "../../../../services/event-store.js";
import type { DomainStateStore } from "../../../../services/state-store.js";
import { UseCase } from "../../../../utils/use-case.js";
import { UnitNotFoundError } from "../../errors.js";

export interface DeleteUnitDependencies {
  state: DomainStateStore;
  events: DomainEventStore;
  crypto: CryptoService;
  currentUser: UserAccess;
}

export const DeleteUnitInputModel = new Schema({
  unitId: Field.uuid(),
});

export type DeleteUnitInput = Infer<typeof DeleteUnitInputModel>;

export const DeleteUnitUseCase = new UseCase({
  name: "deleteUnit",
  type: "command",
  auth: AccessPolicy.WithPermission(Permission.EDIT_COURSE),
  inputSchema: DeleteUnitInputModel,
  effect: (
    { state, events, crypto }: DeleteUnitDependencies,
    { unitId }: DeleteUnitInput,
  ): Effect<void, UnitNotFoundError | UnexpectedError> => {
    return state
      .from("units")
      .where({ id: unitId })
      .selectOneOrFail()
      .mapError(() => new UnitNotFoundError(unitId))
      .flatMap((unit) => {
        const eventId = crypto.randomUUID();

        const unitDeletedEvent = UnitDeletedEvent.from({
          id: eventId,
          streamId: unitId,
          payload: {},
          version: unit.version + 1, // Increment the version
        });

        return events.append("units", unitDeletedEvent).discardValue();
      });
  },
});
