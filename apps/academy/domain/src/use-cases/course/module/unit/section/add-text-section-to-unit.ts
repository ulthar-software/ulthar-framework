import type { Effect, UUID, UnexpectedError } from "@fabric/core";
import { Field, Schema, type Infer } from "@fabric/core";
import type { TextSectionContent } from "../../../../../models/sections/text-section.js";
import { TextSectionAddedEvent } from "../../../../../models/sections/text-section.js";
import { AccessPolicy } from "../../../../../security/access-policy.js";
import { Permission } from "../../../../../security/permission.js";
import type { UserAccess } from "../../../../../services/auth-service.js";
import type { DomainCryptoService } from "../../../../../services/crypto-service.js";
import type { DomainEventStore } from "../../../../../services/event-store.js";
import type { DomainStateStore } from "../../../../../services/state-store.js";
import { UseCase } from "../../../../../utils/use-case.js";
import { UnitNotFoundError } from "../../../errors.js";
import { getMaxSectionOrder } from "./get-max-order.js";

export interface AddTextSectionToUnitDependencies {
  state: DomainStateStore;
  events: DomainEventStore;
  crypto: DomainCryptoService;
  currentUser: UserAccess;
}

export const AddTextSectionToUnitInputModel = new Schema({
  unitId: Field.uuid(),
  text: Field.string({
    minLength: 1,
  }),
});

export type AddTextSectionToUnitInput = Infer<
  typeof AddTextSectionToUnitInputModel
>;

export interface AddTextSectionToUnitOutput {
  sectionId: UUID;
}

export const AddTextSectionToUnitUseCase = new UseCase({
  name: "addTextSectionToUnit",
  type: "command",
  auth: AccessPolicy.WithPermission(Permission.EDIT_COURSE),
  inputSchema: AddTextSectionToUnitInputModel,
  effect: (
    { state, events, crypto, currentUser }: AddTextSectionToUnitDependencies,
    { unitId, text }: AddTextSectionToUnitInput,
  ): Effect<
    AddTextSectionToUnitOutput,
    UnitNotFoundError | UnexpectedError
  > => {
    return state
      .from("units")
      .where({ id: unitId })
      .selectOneOrFail()
      .mapError(() => new UnitNotFoundError(unitId))
      .flatMap(() => getMaxSectionOrder(state, unitId))
      .flatMap((maxOrder) => {
        const sectionId = crypto.randomUUID();
        const eventId = crypto.randomUUID();
        const sectionOrder = maxOrder + 100; // Set order to 100 more than last section

        const textSectionAddedEvent = TextSectionAddedEvent.from({
          id: eventId,
          streamId: sectionId,
          payload: {
            unitId,
            order: sectionOrder,
            createdBy: currentUser.id,
            content: {
              text,
            } as TextSectionContent,
          },
          version: 1,
        });

        return events
          .append("textSections", textSectionAddedEvent)
          .map(() => ({ sectionId }));
      });
  },
});
