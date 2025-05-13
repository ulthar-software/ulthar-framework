import type { EventToType, Infer, Schema } from "@fabric/core";
import {
  AggregateModel,
  AggregateProjector,
  DomainEvent,
  EventStream,
  Field,
} from "@fabric/core";
import {
  BaseSectionAddedEvent,
  BaseSectionFields,
  SectionOrderChangedEvent,
  SectionTitleChangedEvent,
} from "./section-base.js";

// Questionnaire Section Content Model
export const QuestionnaireSectionContentModel = {
  questions: Field.objectArray(
    {
      questionText: Field.string(),
      options: Field.objectArray({
        text: Field.string(),
        isCorrect: Field.boolean(),
      }),
    },
    {},
  ),
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
};

export type QuestionnaireSectionContent = Infer<
  Schema<typeof QuestionnaireSectionContentModel>
>;

// Questionnaire Section Model
export const QuestionnaireSectionModel = new AggregateModel(
  "questionnaireSections",
  {
    ...BaseSectionFields,
    title: Field.string(),
    content: Field.embedded({
      subModel: QuestionnaireSectionContentModel,
    }),
  },
);

export type QuestionnaireSectionModel = typeof QuestionnaireSectionModel;
export type QuestionnaireSection = Infer<QuestionnaireSectionModel>;

// Questionnaire Section Added Event
export const QuestionnaireSectionAddedEvent = new DomainEvent(
  "QuestionnaireSectionAdded",
  {
    ...BaseSectionAddedEvent,
    title: Field.string(),
    content: Field.embedded({
      subModel: QuestionnaireSectionContentModel,
    }),
  },
);

export type QuestionnaireSectionAddedEvent = EventToType<
  typeof QuestionnaireSectionAddedEvent
>;

// Content-specific update events
export const QuestionnaireSectionContentChangedEvent = new DomainEvent(
  "QuestionnaireSectionContentChanged",
  {
    content: Field.embedded({
      subModel: QuestionnaireSectionContentModel,
    }),
    updatedBy: Field.uuid(),
  },
);

export type QuestionnaireSectionContentChangedEvent = EventToType<
  typeof QuestionnaireSectionContentChangedEvent
>;

// Event streams for questionnaire section
export const QuestionnaireSectionEvents = [
  QuestionnaireSectionAddedEvent,
  SectionTitleChangedEvent,
  QuestionnaireSectionContentChangedEvent,
  SectionOrderChangedEvent,
] as const;

export const QuestionnaireSectionStream = new EventStream(
  QuestionnaireSectionModel.name,
  QuestionnaireSectionEvents,
);

// Projector for questionnaire section
export const QuestionnaireSectionProjector = new AggregateProjector(
  QuestionnaireSectionStream.name,
  QuestionnaireSectionModel,
  QuestionnaireSectionEvents,
  {
    QuestionnaireSectionAdded: (event): QuestionnaireSection =>
      QuestionnaireSectionModel.from(event, {
        title: event.payload.title,
        unitId: event.payload.unitId,
        order: event.payload.order,
        createdBy: event.payload.createdBy,
        content: event.payload.content,
      }),
    SectionTitleChanged: (event, section): QuestionnaireSection =>
      QuestionnaireSectionModel.update(section, event, {
        title: event.payload.title,
      }),
    QuestionnaireSectionContentChanged: (
      event,
      section,
    ): QuestionnaireSection =>
      QuestionnaireSectionModel.update(section, event, {
        content: event.payload.content,
      }),
    SectionOrderChanged: (event, section): QuestionnaireSection =>
      QuestionnaireSectionModel.update(section, event, {
        order: event.payload.order,
      }),
  },
);
