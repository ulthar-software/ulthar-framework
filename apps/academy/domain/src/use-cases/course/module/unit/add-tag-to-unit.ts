import type { AlreadyExistsError, Infer, UnexpectedError } from "@fabric/core";
import { Effect, Field, Schema } from "@fabric/core";
import { UnitTagCreatedEvent } from "../../../../models/unit-tag.js";
import { AccessPolicy } from "../../../../security/access-policy.js";
import { Permission } from "../../../../security/permission.js";
import type { UserAccess } from "../../../../services/auth-service.js";
import type { DomainCryptoService } from "../../../../services/crypto-service.js";
import type { DomainEventStore } from "../../../../services/event-store.js";
import type { DomainStateStore } from "../../../../services/state-store.js";
import { UseCase } from "../../../../utils/use-case.js";
import { TagNotFoundError } from "../../../tag/errors.js";
import { UnitNotFoundError } from "../../errors.js";
export interface AddTagToUnitDependencies {
  state: DomainStateStore;
  events: DomainEventStore;
  crypto: DomainCryptoService;
  currentUser: UserAccess;
}

export const AddTagToUnitInputModel = new Schema({
  unitId: Field.uuid(),
  tagId: Field.uuid(),
});
export type AddTagToUnitInput = Infer<typeof AddTagToUnitInputModel>;

export interface AddTagToUnitOutput {
  ok: boolean;
}

export const AddTagToUnitUseCase = new UseCase({
  auth: AccessPolicy.WithPermission(Permission.EDIT_COURSE),
  name: "addTagToUnit",
  type: "command",
  inputSchema: AddTagToUnitInputModel,
  effect: (
    { state, events, crypto, currentUser }: AddTagToUnitDependencies,
    { unitId, tagId }: AddTagToUnitInput,
  ): Effect<
    void,
    UnitNotFoundError | TagNotFoundError | UnexpectedError | AlreadyExistsError
  > => {
    return Effect.fromGen(function* () {
      yield* state
        .from("units")
        .where({ id: unitId })
        .selectOneOrFail()
        .mapError(() => new UnitNotFoundError(unitId));
      yield* state
        .from("tags")
        .where({ id: tagId })
        .selectOneOrFail()
        .mapError(() => new TagNotFoundError(tagId));

      yield* state
        .from("unitTags")
        .where({
          unitId,
          tagId,
        })
        .assertNone();

      yield* events.append(
        "unitTags",
        UnitTagCreatedEvent.from({
          id: crypto.randomUUID(),
          streamId: crypto.randomUUID(),
          payload: {
            unitId,
            tagId,
            createdBy: currentUser.id,
          },
          version: 1,
        }),
      );
    });
  },
});
