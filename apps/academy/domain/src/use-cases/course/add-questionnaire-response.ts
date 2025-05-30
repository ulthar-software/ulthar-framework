import type { CryptoService } from "@fabric/core";
import {
  Effect,
  Field,
  Schema,
  UnexpectedError,
  type Infer,
} from "@fabric/core";
import { QuestionnaireResponseAddedEvent } from "../../models/questionnaire-response.js";
import type {
  QuestionnaireSection,
  QuestionnaireSectionContent,
} from "../../models/sections/questionnaire-section.js";
import { AccessPolicy } from "../../security/access-policy.js";
import type { UserAccess } from "../../services/auth-service.js";
import type { DomainEventStore } from "../../services/event-store.js";
import type { DomainStateStore } from "../../services/state-store.js";
import { UseCase } from "../../utils/use-case.js";
import {
  IncompleteQuestionnaireResponseError,
  QuestionnaireSectionNotFoundError,
  QuestionnaireVersionMismatchError,
} from "./errors.js";

export interface AddQuestionnaireResponseDependencies {
  state: DomainStateStore;
  events: DomainEventStore;
  crypto: CryptoService;
  currentUser: UserAccess;
}

export const AddQuestionnaireResponseInputModel = new Schema({
  questionnaireId: Field.uuid(),
  questionnaireVersion: Field.integer({
    isUnsigned: true,
  }),
  answers: Field.array(
    Field.integer({
      isUnsigned: true,
    }),
  ),
});

export type AddQuestionnaireResponseInput = Infer<
  typeof AddQuestionnaireResponseInputModel
>;

export const AddQuestionnaireResponseUseCase = new UseCase({
  name: "addQuestionnaireResponse",
  type: "command",
  auth: AccessPolicy.Authenticated(),
  inputSchema: AddQuestionnaireResponseInputModel,
  effect: (
    {
      state,
      events,
      crypto,
      currentUser,
    }: AddQuestionnaireResponseDependencies,
    {
      questionnaireId,
      questionnaireVersion,
      answers,
    }: AddQuestionnaireResponseInput,
  ): Effect<
    void,
    | QuestionnaireSectionNotFoundError
    | QuestionnaireVersionMismatchError
    | IncompleteQuestionnaireResponseError
    | UnexpectedError
  > => {
    // First check if the questionnaire section exists and get its content
    return state
      .from("questionnaireSections")
      .where({ id: questionnaireId })
      .selectOneOrFail()
      .mapError(() => new QuestionnaireSectionNotFoundError(questionnaireId))
      .flatMap(
        (
          questionnaireSection: QuestionnaireSection,
        ): Effect<
          QuestionnaireSection,
          | QuestionnaireVersionMismatchError
          | IncompleteQuestionnaireResponseError
        > => {
          // Verify that the version matches what we expect
          if (questionnaireSection.version !== questionnaireVersion) {
            return Effect.failWith(
              new QuestionnaireVersionMismatchError(
                questionnaireId,
                questionnaireVersion,
                questionnaireSection.version,
              ),
            );
          }

          // Check if the user has answered all questions
          const { questions } =
            questionnaireSection.content as QuestionnaireSectionContent;
          if (answers.length !== questions.length) {
            return Effect.failWith(
              new IncompleteQuestionnaireResponseError(
                questionnaireId,
                answers.length,
                questions.length,
              ),
            );
          }

          return Effect.ok(questionnaireSection);
        },
      )
      .flatMap((questionnaireSection) =>
        addQuestionnaireResponse(
          { state, events, crypto, currentUser },
          questionnaireSection,
          answers,
        ),
      );
  },
});

function addQuestionnaireResponse(
  { state, events, crypto, currentUser }: AddQuestionnaireResponseDependencies,
  questionnaireSection: QuestionnaireSection,
  answers: number[],
): Effect<void, UnexpectedError> {
  return state
    .from("questionnaireResponses")
    .where({ questionnaireId: questionnaireSection.id, userId: currentUser.id })
    .selectOne()
    .mapError(() => new UnexpectedError())
    .flatMap((questionnaireResponse) => {
      // Calculate the score
      // Calculate the score based on answers and correct options
      const score = calculateQuestionnaireScore(questionnaireSection, answers);

      // Create a response ID
      const responseId = questionnaireResponse.isValue()
        ? questionnaireResponse.value.id
        : crypto.randomUUID();
      const eventId = crypto.randomUUID();

      // Create the QuestionnaireResponseAdded event
      const questionnaireResponseAddedEvent =
        QuestionnaireResponseAddedEvent.from({
          id: eventId,
          streamId: responseId,
          payload: {
            questionnaireId: questionnaireSection.id,
            questionnaireVersion: questionnaireSection.version,
            userId: currentUser.id,
            answers,
            score,
          },
          version: questionnaireResponse.isValue()
            ? questionnaireResponse.value.version + 1
            : 1,
        });

      // Append the event
      return events
        .append("questionnaireResponses", questionnaireResponseAddedEvent)
        .discardValue();
    });
}

function calculateQuestionnaireScore(
  questionnaire: QuestionnaireSection,
  answers: number[],
): number {
  // Get the questions from the questionnaire
  const { questions } = questionnaire.content as QuestionnaireSectionContent;

  // Note: We no longer need this check here since we're doing it before creating the event
  // The validation is now done in the use case before calling this function

  // Calculate the number of correct answers
  let correctAnswers = 0;
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    const selectedAnswerIndex = answers[i];

    // Check if the selected answer exists and is correct
    if (
      selectedAnswerIndex >= 0 &&
      selectedAnswerIndex < question.options.length &&
      question.options[selectedAnswerIndex].isCorrect
    ) {
      correctAnswers++;
    }
  }

  // Calculate percentage score (0-100)
  const percentageScore = (correctAnswers / questions.length) * 100;

  return Math.round(percentageScore);
}
