import type { Effect, UUID } from "@fabric/core";
import { Field, Schema, UnexpectedError, type Infer } from "@fabric/core";
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

export interface AddTextSectionToUnitDependencies {
  state: DomainStateStore;
  events: DomainEventStore;
  crypto: DomainCryptoService;
  currentUser: UserAccess;
}

export const AddTextSectionToUnitInputModel = new Schema({
  unitId: Field.uuid(),
  title: Field.string({
    minLength: 3,
  }),
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
    { unitId, title, text }: AddTextSectionToUnitInput,
  ): Effect<
    AddTextSectionToUnitOutput,
    UnitNotFoundError | UnexpectedError
  > => {
    return state
      .from("units")
      .where({ id: unitId })
      .selectOneOrFail()
      .mapError(() => new UnitNotFoundError(unitId))
      .flatMap(() => {
        // Get the count of existing sections for this unit to determine the order
        return state
          .from("textSections")
          .where({ unitId })
          .count()
          .mapError(() => new UnexpectedError())
          .flatMap((count) => {
            const sectionId = crypto.randomUUID();
            const eventId = crypto.randomUUID();
            const sectionOrder = count * 100 + 100; // Set order to 100 more than last section (maintains spacing of 100)

            const textSectionAddedEvent = TextSectionAddedEvent.from({
              id: eventId,
              streamId: sectionId,
              payload: {
                title,
                unitId,
                order: sectionOrder,
                createdBy: currentUser.id,
                content: {
                  text,
                } as TextSectionContent,
              },
              version: 1n,
            });

            return events
              .append("textSections", textSectionAddedEvent)
              .map(() => ({ sectionId }));
          });
      });
  },
});
