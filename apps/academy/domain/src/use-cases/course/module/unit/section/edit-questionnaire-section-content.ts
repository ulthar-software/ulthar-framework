import type {
  CryptoService,
  Effect,
  UUID,
  UnexpectedError,
} from "@fabric/core";
import { Field, Schema, type Infer } from "@fabric/core";
import { QuestionnaireSectionContentChangedEvent } from "../../../../../models/index.js";
import { AccessPolicy } from "../../../../../security/access-policy.js";
import { Permission } from "../../../../../security/permission.js";
import type { UserAccess } from "../../../../../services/auth-service.js";
import type { DomainEventStore } from "../../../../../services/event-store.js";
import type { DomainStateStore } from "../../../../../services/state-store.js";
import { UseCase } from "../../../../../utils/use-case.js";
import { QuestionnaireSectionNotFoundError } from "../../../errors.js";

export interface EditQuestionnaireSectionContentDependencies {
  state: DomainStateStore;
  events: DomainEventStore;
  crypto: CryptoService;
  currentUser: UserAccess;
}

const QuestionOptionSchema = {
  text: Field.string({
    minLength: 1,
  }),
  isCorrect: Field.boolean(),
};

// Define the question schema
const QuestionSchema = {
  questionText: Field.string({
    minLength: 1,
  }),
  options: Field.objectArray(QuestionOptionSchema, {
    minLength: 1,
  }),
};

export const EditQuestionnaireSectionContentInputModel = new Schema({
  sectionId: Field.uuid(),
  title: Field.string({
    minLength: 3,
  }),
  questions: Field.objectArray(QuestionSchema, {
    minLength: 1,
  }),
  questionsToShow: Field.integer({
    isUnsigned: true,
    isOptional: true,
  }),
  randomizeQuestions: Field.boolean({
    isOptional: true,
  }),
  passingScore: Field.integer({
    isUnsigned: true,
    isOptional: true,
  }),
});

export type EditQuestionnaireSectionContentInput = Infer<
  typeof EditQuestionnaireSectionContentInputModel
>;

export interface EditQuestionnaireSectionContentOutput {
  sectionId: UUID;
}

export const EditQuestionnaireSectionContentUseCase = new UseCase({
  name: "editQuestionnaireSectionContent",
  type: "command",
  auth: AccessPolicy.WithPermission(Permission.EDIT_COURSE),
  inputSchema: EditQuestionnaireSectionContentInputModel,
  effect: (
    {
      state,
      events,
      currentUser,
      crypto,
    }: EditQuestionnaireSectionContentDependencies,
    { sectionId, title, ...payload }: EditQuestionnaireSectionContentInput,
  ): Effect<
    EditQuestionnaireSectionContentOutput,
    QuestionnaireSectionNotFoundError | UnexpectedError
  > => {
    return state
      .from("questionnaireSections")
      .where({ id: sectionId })
      .selectOneOrFail()
      .mapError(() => new QuestionnaireSectionNotFoundError(sectionId))
      .flatMap((section) => {
        const questionnaireSectionContentChangedEvent =
          QuestionnaireSectionContentChangedEvent.from({
            id: crypto.randomUUID(),
            streamId: sectionId,
            payload: {
              title: title,
              content: payload,
              updatedBy: currentUser.id,
            },
            version: section.version + 1,
          });

        return events
          .append(
            "questionnaireSections",
            questionnaireSectionContentChangedEvent,
          )
          .map(() => ({ sectionId }));
      });
  },
});
