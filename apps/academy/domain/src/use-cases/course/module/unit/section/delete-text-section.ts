import type { CryptoService, Effect, UnexpectedError } from "@fabric/core";
import { Field, Schema, type Infer } from "@fabric/core";
import { SectionDeletedEvent } from "../../../../../models/sections/section-base.js";
import { AccessPolicy } from "../../../../../security/access-policy.js";
import { Permission } from "../../../../../security/permission.js";
import type { UserAccess } from "../../../../../services/auth-service.js";
import type { DomainEventStore } from "../../../../../services/event-store.js";
import type { DomainStateStore } from "../../../../../services/state-store.js";
import { UseCase } from "../../../../../utils/use-case.js";
import { TextSectionNotFoundError } from "../../../errors.js";

export interface DeleteTextSectionDependencies {
  state: DomainStateStore;
  events: DomainEventStore;
  crypto: CryptoService;
  currentUser: UserAccess;
}

export const DeleteTextSectionInputModel = new Schema({
  sectionId: Field.uuid(),
});

export type DeleteTextSectionInput = Infer<typeof DeleteTextSectionInputModel>;

export const DeleteTextSectionUseCase = new UseCase({
  name: "deleteTextSection",
  type: "command",
  auth: AccessPolicy.WithPermission(Permission.EDIT_COURSE),
  inputSchema: DeleteTextSectionInputModel,
  effect: (
    { state, events, crypto }: DeleteTextSectionDependencies,
    { sectionId }: DeleteTextSectionInput,
  ): Effect<void, TextSectionNotFoundError | UnexpectedError> => {
    return state
      .from("textSections")
      .where({ id: sectionId })
      .selectOneOrFail()
      .mapError(() => new TextSectionNotFoundError(sectionId))
      .flatMap((section) => {
        const eventId = crypto.randomUUID();

        const sectionDeletedEvent = SectionDeletedEvent.from({
          id: eventId,
          streamId: sectionId,
          payload: {},
          version: section.version + 1, // Increment the version
        });

        return events
          .append("textSections", sectionDeletedEvent)
          .discardValue();
      });
  },
});
