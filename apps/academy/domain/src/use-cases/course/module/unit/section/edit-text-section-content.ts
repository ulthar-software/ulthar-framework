import type {
  CryptoService,
  Effect,
  UUID,
  UnexpectedError,
} from "@fabric/core";
import { Field, Schema, type Infer } from "@fabric/core";
import { TextSectionContentChangedEvent } from "../../../../../models/sections/text-section.js";
import { AccessPolicy } from "../../../../../security/access-policy.js";
import { Permission } from "../../../../../security/permission.js";
import type { UserAccess } from "../../../../../services/auth-service.js";
import type { DomainEventStore } from "../../../../../services/event-store.js";
import type { DomainStateStore } from "../../../../../services/state-store.js";
import { UseCase } from "../../../../../utils/use-case.js";
import { UnitNotFoundError } from "../../../errors.js";

export interface EditTextSectionContentDependencies {
  state: DomainStateStore;
  events: DomainEventStore;
  crypto: CryptoService;
  currentUser: UserAccess;
}

export const EditTextSectionContentInputModel = new Schema({
  sectionId: Field.uuid(),
  text: Field.string({
    minLength: 1,
  }),
});

export type EditTextSectionContentInput = Infer<
  typeof EditTextSectionContentInputModel
>;

export interface EditTextSectionContentOutput {
  sectionId: UUID;
}

export const EditTextSectionContentUseCase = new UseCase({
  name: "editTextSectionContent",
  type: "command",
  auth: AccessPolicy.WithPermission(Permission.EDIT_COURSE),
  inputSchema: EditTextSectionContentInputModel,
  effect: (
    { state, events, currentUser, crypto }: EditTextSectionContentDependencies,
    { sectionId, text }: EditTextSectionContentInput,
  ): Effect<
    EditTextSectionContentOutput,
    UnitNotFoundError | UnexpectedError
  > => {
    return state
      .from("textSections")
      .where({ id: sectionId })
      .selectOneOrFail()
      .mapError(() => new UnitNotFoundError(sectionId))
      .flatMap((section) => {
        const textSectionContentChangedEvent =
          TextSectionContentChangedEvent.from({
            id: crypto.randomUUID(),
            streamId: sectionId,
            payload: {
              content: {
                text,
              },
              updatedBy: currentUser.id,
            },
            version: section.version + 1,
          });

        return events
          .append("textSections", textSectionContentChangedEvent)
          .map(() => ({ sectionId }));
      });
  },
});
