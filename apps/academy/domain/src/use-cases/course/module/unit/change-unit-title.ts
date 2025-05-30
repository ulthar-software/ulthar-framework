import type { CryptoService, UnexpectedError } from "@fabric/core";
import { Effect, Field, Schema, type Infer } from "@fabric/core";
import { UnitTitleChangedEvent } from "../../../../models/unit.js";
import { AccessPolicy } from "../../../../security/access-policy.js";
import { Permission } from "../../../../security/permission.js";
import type { UserAccess } from "../../../../services/auth-service.js";
import type { DomainEventStore } from "../../../../services/event-store.js";
import type { DomainStateStore } from "../../../../services/state-store.js";
import { UseCase } from "../../../../utils/use-case.js";
import { UnitNotFoundError } from "../../errors.js";

export interface ChangeUnitTitleDependencies {
  state: DomainStateStore;
  events: DomainEventStore;
  crypto: CryptoService;
  currentUser: UserAccess;
}

export const ChangeUnitTitleInputModel = new Schema({
  unitId: Field.uuid(),
  title: Field.string({
    minLength: 3,
  }),
});

export type ChangeUnitTitleInput = Infer<typeof ChangeUnitTitleInputModel>;

export const ChangeUnitTitleUseCase = new UseCase({
  name: "changeUnitTitle",
  type: "command",
  auth: AccessPolicy.WithPermission(Permission.EDIT_COURSE),
  inputSchema: ChangeUnitTitleInputModel,
  effect: (
    { state, events, crypto, currentUser }: ChangeUnitTitleDependencies,
    { unitId, title }: ChangeUnitTitleInput,
  ): Effect<void, UnitNotFoundError | UnexpectedError> => {
    return Effect.fromGen(function* () {
      // Check if the unit exists
      const unitResult = yield* state
        .from("units")
        .where({ id: unitId })
        .selectOneOrFail()
        .mapError(() => new UnitNotFoundError(unitId));

      const unit = unitResult;
      const eventId = crypto.randomUUID();

      // Create the event for changing the unit title
      const unitTitleChangedEvent = UnitTitleChangedEvent.from({
        id: eventId,
        streamId: unitId,
        payload: {
          title,
          updatedBy: currentUser.id,
        },
        version: unit.version + 1, // Increment the version
      });

      // Append the event to the event store
      yield* events.append("units", unitTitleChangedEvent);
    });
  },
});
