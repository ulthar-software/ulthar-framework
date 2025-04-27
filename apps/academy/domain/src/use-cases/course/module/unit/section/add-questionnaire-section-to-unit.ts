import type { Effect, UUID, UnexpectedError } from "@fabric/core";
import { Field, Schema, type Infer } from "@fabric/core";
import type { QuestionnaireSectionContent } from "../../../../../models/sections/questionnaire-section.js";
import { QuestionnaireSectionAddedEvent } from "../../../../../models/sections/questionnaire-section.js";
import { AccessPolicy } from "../../../../../security/access-policy.js";
import { Permission } from "../../../../../security/permission.js";
import type { UserAccess } from "../../../../../services/auth-service.js";
import type { DomainCryptoService } from "../../../../../services/crypto-service.js";
import type { DomainEventStore } from "../../../../../services/event-store.js";
import type { DomainStateStore } from "../../../../../services/state-store.js";
import { UseCase } from "../../../../../utils/use-case.js";
import { UnitNotFoundError } from "../../../errors.js";
import { getMaxSectionOrder } from "./get-max-order.js";

export interface AddQuestionnaireSectionToUnitDependencies {
  state: DomainStateStore;
  events: DomainEventStore;
  crypto: DomainCryptoService;
  currentUser: UserAccess;
}

// Define the question option schema
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

export const AddQuestionnaireSectionToUnitInputModel = new Schema({
  unitId: Field.uuid(),
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

export type AddQuestionnaireSectionToUnitInput = Infer<
  typeof AddQuestionnaireSectionToUnitInputModel
>;

export interface AddQuestionnaireSectionToUnitOutput {
  sectionId: UUID;
}

export const AddQuestionnaireSectionToUnitUseCase = new UseCase({
  name: "addQuestionnaireSectionToUnit",
  type: "command",
  auth: AccessPolicy.WithPermission(Permission.EDIT_COURSE),
  inputSchema: AddQuestionnaireSectionToUnitInputModel,
  effect: (
    {
      state,
      events,
      crypto,
      currentUser,
    }: AddQuestionnaireSectionToUnitDependencies,
    {
      unitId,
      title,
      questions,
      questionsToShow,
      randomizeQuestions,
      passingScore,
    }: AddQuestionnaireSectionToUnitInput,
  ): Effect<
    AddQuestionnaireSectionToUnitOutput,
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

        const questionnaireSectionAddedEvent =
          QuestionnaireSectionAddedEvent.from({
            id: eventId,
            streamId: sectionId,
            payload: {
              title,
              unitId,
              order: sectionOrder,
              createdBy: currentUser.id,
              content: {
                questions,
                questionsToShow,
                randomizeQuestions,
                passingScore,
              } as QuestionnaireSectionContent,
            },
            version: 1,
          });

        return events
          .append("questionnaireSections", questionnaireSectionAddedEvent)
          .map(() => ({ sectionId }));
      });
  },
});
