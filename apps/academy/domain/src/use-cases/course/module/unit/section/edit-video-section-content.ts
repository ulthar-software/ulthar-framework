import type { Effect, UUID, UnexpectedError } from "@fabric/core";
import { Field, Schema, type Infer } from "@fabric/core";
import { VideoSectionContentChangedEvent } from "../../../../../models/sections/video-section.js";
import { AccessPolicy } from "../../../../../security/access-policy.js";
import { Permission } from "../../../../../security/permission.js";
import type { UserAccess } from "../../../../../services/auth-service.js";
import type { DomainCryptoService } from "../../../../../services/crypto-service.js";
import type { DomainEventStore } from "../../../../../services/event-store.js";
import type { DomainStateStore } from "../../../../../services/state-store.js";
import { UseCase } from "../../../../../utils/use-case.js";
import { UnitNotFoundError } from "../../../errors.js";

export interface EditVideoSectionContentDependencies {
  state: DomainStateStore;
  events: DomainEventStore;
  crypto: DomainCryptoService;
  currentUser: UserAccess;
}

export const EditVideoSectionContentInputModel = new Schema({
  sectionId: Field.uuid(),
  videoUrl: Field.url(),
});

export type EditVideoSectionContentInput = Infer<
  typeof EditVideoSectionContentInputModel
>;

export interface EditVideoSectionContentOutput {
  sectionId: UUID;
}

export const EditVideoSectionContentUseCase = new UseCase({
  name: "editVideoSectionContent",
  type: "command",
  auth: AccessPolicy.WithPermission(Permission.EDIT_COURSE),
  inputSchema: EditVideoSectionContentInputModel,
  effect: (
    { state, events, currentUser, crypto }: EditVideoSectionContentDependencies,
    { sectionId, videoUrl }: EditVideoSectionContentInput,
  ): Effect<
    EditVideoSectionContentOutput,
    UnitNotFoundError | UnexpectedError
  > => {
    return state
      .from("videoSections")
      .where({ id: sectionId })
      .selectOneOrFail()
      .mapError(() => new UnitNotFoundError(sectionId))
      .flatMap((section) => {
        const videoSectionContentChangedEvent =
          VideoSectionContentChangedEvent.from({
            id: crypto.randomUUID(),
            streamId: sectionId,
            payload: {
              content: {
                videoUrl,
              },
              updatedBy: currentUser.id,
            },
            version: section.version + 1,
          });

        return events
          .append("videoSections", videoSectionContentChangedEvent)
          .map(() => ({ sectionId }));
      });
  },
});
