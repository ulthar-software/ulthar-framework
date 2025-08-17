import type { CryptoService, Effect, UnexpectedError } from "@fabric/core";
import { Field, Schema, type Infer } from "@fabric/core";
import { UnitOrderChangedEvent } from "../../../../models/unit.js";
import { AccessPolicy } from "../../../../security/access-policy.js";
import { Permission } from "../../../../security/permission.js";
import type { UserAccess } from "../../../../services/auth-service.js";
import type { DomainEventStore } from "../../../../services/event-store.js";
import type { DomainStateStore } from "../../../../services/state-store.js";
import { UseCase } from "../../../../utils/use-case.js";
import { UnitNotFoundError } from "../../errors.js";

export interface ChangeUnitOrderDependencies {
  state: DomainStateStore;
  events: DomainEventStore;
  crypto: CryptoService;
  currentUser: UserAccess;
}

export const ChangeUnitOrderInputModel = new Schema({
  unitId: Field.uuid(),
  order: Field.integer({
    isUnsigned: true,
    hasArbitraryPrecision: false,
  }),
});

export type ChangeUnitOrderInput = Infer<typeof ChangeUnitOrderInputModel>;

export const ChangeUnitOrderUseCase = new UseCase({
  name: "changeUnitOrder",
  type: "command",
  auth: AccessPolicy.WithPermission(Permission.EDIT_COURSE),
  inputSchema: ChangeUnitOrderInputModel,
  effect: (
    { state, events, crypto, currentUser }: ChangeUnitOrderDependencies,
    { unitId, order }: ChangeUnitOrderInput,
  ): Effect<void, UnitNotFoundError | UnexpectedError> => {
    return state
      .from("units")
      .where({ id: unitId })
      .selectOneOrFail()
      .mapError(() => new UnitNotFoundError(unitId))
      .flatMap((unit) => {
        const eventId = crypto.randomUUID();

        const unitOrderChangedEvent = UnitOrderChangedEvent.from({
          id: eventId,
          streamId: unitId,
          payload: {
            order,
            updatedBy: currentUser.id,
          },
          version: unit.version + 1, // Increment the version
        });

        return events.append("units", unitOrderChangedEvent).discardValue();
      });
  },
});
