import type { Effect, UUID, UnexpectedError } from "@fabric/core";
import { Field, Schema, type Infer } from "@fabric/core";
import type { VideoSectionContent } from "../../../../../models/sections/video-section.js";
import { VideoSectionAddedEvent } from "../../../../../models/sections/video-section.js";
import { AccessPolicy } from "../../../../../security/access-policy.js";
import { Permission } from "../../../../../security/permission.js";
import type { UserAccess } from "../../../../../services/auth-service.js";
import type { DomainCryptoService } from "../../../../../services/crypto-service.js";
import type { DomainEventStore } from "../../../../../services/event-store.js";
import type { DomainStateStore } from "../../../../../services/state-store.js";
import { UseCase } from "../../../../../utils/use-case.js";
import { UnitNotFoundError } from "../../../errors.js";
import { getMaxSectionOrder } from "./get-max-order.js";

export interface AddVideoSectionToUnitDependencies {
  state: DomainStateStore;
  events: DomainEventStore;
  crypto: DomainCryptoService;
  currentUser: UserAccess;
}

export const AddVideoSectionToUnitInputModel = new Schema({
  unitId: Field.uuid(),
  title: Field.string({
    minLength: 3,
  }),
  videoUrl: Field.url(),
});

export type AddVideoSectionToUnitInput = Infer<
  typeof AddVideoSectionToUnitInputModel
>;

export interface AddVideoSectionToUnitOutput {
  sectionId: UUID;
}

export const AddVideoSectionToUnitUseCase = new UseCase({
  name: "addVideoSectionToUnit",
  type: "command",
  auth: AccessPolicy.WithPermission(Permission.EDIT_COURSE),
  inputSchema: AddVideoSectionToUnitInputModel,
  effect: (
    { state, events, crypto, currentUser }: AddVideoSectionToUnitDependencies,
    { unitId, title, videoUrl }: AddVideoSectionToUnitInput,
  ): Effect<
    AddVideoSectionToUnitOutput,
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

        const videoSectionAddedEvent = VideoSectionAddedEvent.from({
          id: eventId,
          streamId: sectionId,
          payload: {
            title,
            unitId,
            order: sectionOrder,
            createdBy: currentUser.id,
            content: {
              videoUrl,
            } as VideoSectionContent,
          },
          version: 1,
        });

        return events
          .append("videoSections", videoSectionAddedEvent)
          .map(() => ({ sectionId }));
      });
  },
});
