import type { CryptoService, UUID } from "@fabric/core";
import {
  Effect,
  Field,
  Schema,
  UnexpectedError,
  type Infer,
} from "@fabric/core";
import { UnitTagCreatedEvent } from "../../../../models/unit-tag.js";
import { UnitAddedEvent } from "../../../../models/unit.js";
import { AccessPolicy } from "../../../../security/access-policy.js";
import { Permission } from "../../../../security/permission.js";
import type { UserAccess } from "../../../../services/auth-service.js";
import type { DomainEventStore } from "../../../../services/event-store.js";
import type { DomainStateStore } from "../../../../services/state-store.js";
import { UseCase } from "../../../../utils/use-case.js";
import { TagNotFoundError } from "../../../tag/errors.js";
import { ModuleNotFoundError } from "../../errors.js";

export interface AddUnitToModuleDependencies {
  state: DomainStateStore;
  events: DomainEventStore;
  crypto: CryptoService;
  currentUser: UserAccess;
}

export const AddUnitToModuleInputModel = new Schema({
  moduleId: Field.uuid(),
  title: Field.string({
    minLength: 3,
  }),
  tagIds: Field.array(Field.uuid(), {
    isOptional: true,
  }),
});

export type AddUnitToModuleInput = Infer<typeof AddUnitToModuleInputModel>;

export interface AddUnitToModuleOutput {
  unitId: UUID;
}

export const AddUnitToModuleUseCase = new UseCase({
  name: "addUnitToModule",
  type: "command",
  auth: AccessPolicy.WithPermission(Permission.EDIT_COURSE),
  inputSchema: AddUnitToModuleInputModel,
  effect: (
    { state, events, crypto, currentUser }: AddUnitToModuleDependencies,
    { moduleId, title, tagIds }: AddUnitToModuleInput,
  ): Effect<AddUnitToModuleOutput, ModuleNotFoundError | UnexpectedError> => {
    return Effect.fromGen(function* () {
      yield* state
        .from("modules")
        .where({ id: moduleId })
        .selectOneOrFail()
        .mapError(() => new ModuleNotFoundError(moduleId));

      const count = yield* state
        .from("units")
        .where({ moduleId })
        .count()
        .mapError(() => new UnexpectedError());

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
        version: 1,
      });

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (tagIds) {
        for (const tagId of tagIds) {
          // Check if the tag exists
          yield* state
            .from("tags")
            .where({ id: tagId })
            .selectOneOrFail()
            .mapError(() => new TagNotFoundError(tagId));
        }
      }

      yield* events.append("units", unitAddedEvent);

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (tagIds) {
        yield* Effect.all(() =>
          tagIds.map((tagId) => {
            const unitTagId = crypto.randomUUID();
            const unitTagEventId = crypto.randomUUID();

            const unitTagEvent = UnitTagCreatedEvent.from({
              id: unitTagEventId,
              streamId: unitTagId,
              payload: {
                unitId,
                tagId,
                createdBy: currentUser.id,
              },
              version: 1,
            });

            return events.append("unitTags", unitTagEvent);
          }),
        );
      }

      return { unitId };
    });
  },
});
