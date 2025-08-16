import type { CryptoService, Effect, UnexpectedError } from "@fabric/core";
import { Field, Schema, type Infer } from "@fabric/core";
import { SectionDeletedEvent } from "../../../../../models/sections/section-base.js";
import { AccessPolicy } from "../../../../../security/access-policy.js";
import { Permission } from "../../../../../security/permission.js";
import type { UserAccess } from "../../../../../services/auth-service.js";
import type { DomainEventStore } from "../../../../../services/event-store.js";
import type { DomainStateStore } from "../../../../../services/state-store.js";
import { UseCase } from "../../../../../utils/use-case.js";
import { VideoSectionNotFoundError } from "../../../errors.js";

export interface DeleteVideoSectionDependencies {
  state: DomainStateStore;
  events: DomainEventStore;
  crypto: CryptoService;
  currentUser: UserAccess;
}

export const DeleteVideoSectionInputModel = new Schema({
  sectionId: Field.uuid(),
});

export type DeleteVideoSectionInput = Infer<
  typeof DeleteVideoSectionInputModel
>;

export const DeleteVideoSectionUseCase = new UseCase({
  name: "deleteVideoSection",
  type: "command",
  auth: AccessPolicy.WithPermission(Permission.EDIT_COURSE),
  inputSchema: DeleteVideoSectionInputModel,
  effect: (
    { state, events, crypto }: DeleteVideoSectionDependencies,
    { sectionId }: DeleteVideoSectionInput,
  ): Effect<void, VideoSectionNotFoundError | UnexpectedError> => {
    return state
      .from("videoSections")
      .where({ id: sectionId })
      .selectOneOrFail()
      .mapError(() => new VideoSectionNotFoundError(sectionId))
      .flatMap((section) => {
        const eventId = crypto.randomUUID();

        const sectionDeletedEvent = SectionDeletedEvent.from({
          id: eventId,
          streamId: sectionId,
          payload: {},
          version: section.version + 1, // Increment the version
        });

        return events
          .append("videoSections", sectionDeletedEvent)
          .discardValue();
      });
  },
});
