import type { Infer } from "@fabric/core";
import {
  AggregateModel,
  AggregateProjector,
  DomainEvent,
  EventStream,
  Field,
} from "@fabric/core";

// Questionnaire Response Model
export const QuestionnaireResponseModel = new AggregateModel(
  "questionnaireResponses",
  {
    questionnaireId: Field.reference({
      targetModel: "questionnaireSections",
    }),
    questionnaireVersion: Field.integer({
      isUnsigned: true,
    }),
    userId: Field.reference({
      targetModel: "users",
    }),
    answers: Field.array(
      Field.integer({
        isUnsigned: true,
      }),
    ),
    score: Field.integer({
      isUnsigned: true,
    }),
  },
);
export type QuestionnaireResponseModel = typeof QuestionnaireResponseModel;
export type QuestionnaireResponse = Infer<QuestionnaireResponseModel>;

// Questionnaire Response Added Event
export const QuestionnaireResponseAddedEvent = new DomainEvent(
  "QuestionnaireResponseAdded",
  {
    questionnaireId: Field.reference({
      targetModel: "questionnaireSections",
    }),
    questionnaireVersion: Field.integer({
      isUnsigned: true,
    }),
    userId: Field.reference({
      targetModel: "users",
    }),
    answers: Field.array(
      Field.integer({
        isUnsigned: true,
      }),
    ),
    score: Field.integer({
      isUnsigned: true,
    }),
  },
);
export type QuestionnaireResponseAddedEvent = Infer<
  typeof QuestionnaireResponseAddedEvent
>;

export const QuestionnaireResponseModelEvents = [
  QuestionnaireResponseAddedEvent,
] as const;
export type QuestionnaireResponseModelEvents =
  typeof QuestionnaireResponseModelEvents;

export const QuestionnaireResponseStream = new EventStream(
  QuestionnaireResponseModel.name,
  QuestionnaireResponseModelEvents,
);

export const QuestionnaireResponseProjector = new AggregateProjector(
  QuestionnaireResponseModel.name,
  QuestionnaireResponseModel,
  QuestionnaireResponseModelEvents,
  {
    QuestionnaireResponseAdded: (e, a) => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!a) {
        return QuestionnaireResponseModel.from(e, e.payload);
      } else {
        return QuestionnaireResponseModel.update(a, e, e.payload);
      }
    },
  },
);
