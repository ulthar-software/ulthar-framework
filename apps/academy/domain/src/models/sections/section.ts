import type { EnumToType, EventToType, Infer } from "@fabric/core";
import {
  AggregateModel,
  AggregateProjector,
  DomainEvent,
  EventStream,
  Field,
} from "@fabric/core";
import {
  QuestionnaireSectionContentModel,
  TextSectionContentModel,
  VideoSectionContentModel,
} from "./section-types.js";

// Common fields that all section types share
const BaseSectionFields = {
  title: Field.string(),
  unitId: Field.reference({
    targetModel: "units",
  }),
  order: Field.integer({
    isUnsigned: true,
  }),
  createdBy: Field.reference({
    targetModel: "users",
  }),
};

// Text Section Model
export const TextSectionModel = new AggregateModel("textSections", {
  ...BaseSectionFields,
  content: Field.embedded({
    subModel: TextSectionContentModel,
  }),
});

export type TextSectionModel = typeof TextSectionModel;
export type TextSection = Infer<TextSectionModel>;

// Video Section Model
export const VideoSectionModel = new AggregateModel("videoSections", {
  ...BaseSectionFields,
  content: Field.embedded({
    subModel: VideoSectionContentModel,
  }),
});

export type VideoSectionModel = typeof VideoSectionModel;
export type VideoSection = Infer<VideoSectionModel>;

// Questionnaire Section Model
export const QuestionnaireSectionModel = new AggregateModel(
  "questionnaireSections",
  {
    ...BaseSectionFields,
    content: Field.embedded({
      subModel: QuestionnaireSectionContentModel,
    }),
  },
);

export type QuestionnaireSectionModel = typeof QuestionnaireSectionModel;
export type QuestionnaireSection = Infer<QuestionnaireSectionModel>;

// Union type that represents any type of section
export type SectionUnion = TextSection | VideoSection | QuestionnaireSection;

// Events

// For compatibility with existing code, we'll keep the section type enum
export const SectionType = {
  TEXT: "TEXT",
  VIDEO: "VIDEO",
  QUESTIONNAIRE: "QUESTIONNAIRE",
} as const;

export const SectionTypeValues = Object.values(SectionType);
export type SectionType = EnumToType<typeof SectionType>;

// Base Section Added Event (holds common fields)
export const BaseSectionAddedEvent = {
  title: Field.string(),
  unitId: Field.uuid(),
  order: Field.integer({
    isUnsigned: true,
  }),
  createdBy: Field.uuid(),
};

// Text Section Added Event
export const TextSectionAddedEvent = new DomainEvent("TextSectionAdded", {
  ...BaseSectionAddedEvent,
  content: Field.embedded({
    subModel: TextSectionContentModel,
  }),
});

export type TextSectionAddedEvent = EventToType<typeof TextSectionAddedEvent>;

// Video Section Added Event
export const VideoSectionAddedEvent = new DomainEvent("VideoSectionAdded", {
  ...BaseSectionAddedEvent,
  content: Field.embedded({
    subModel: VideoSectionContentModel,
  }),
});

export type VideoSectionAddedEvent = EventToType<typeof VideoSectionAddedEvent>;

// Questionnaire Section Added Event
export const QuestionnaireSectionAddedEvent = new DomainEvent(
  "QuestionnaireSectionAdded",
  {
    ...BaseSectionAddedEvent,
    content: Field.embedded({
      subModel: QuestionnaireSectionContentModel,
    }),
  },
);

export type QuestionnaireSectionAddedEvent = EventToType<
  typeof QuestionnaireSectionAddedEvent
>;

// Common modification events that apply to all section types
export const SectionTitleChangedEvent = new DomainEvent("SectionTitleChanged", {
  title: Field.string(),
  updatedBy: Field.uuid(),
});

export type SectionTitleChangedEvent = EventToType<
  typeof SectionTitleChangedEvent
>;

// Content-specific update events
export const TextSectionContentChangedEvent = new DomainEvent(
  "TextSectionContentChanged",
  {
    content: Field.embedded({
      subModel: TextSectionContentModel,
    }),
    updatedBy: Field.uuid(),
  },
);

export type TextSectionContentChangedEvent = EventToType<
  typeof TextSectionContentChangedEvent
>;

export const VideoSectionContentChangedEvent = new DomainEvent(
  "VideoSectionContentChanged",
  {
    content: Field.embedded({
      subModel: VideoSectionContentModel,
    }),
    updatedBy: Field.uuid(),
  },
);

export type VideoSectionContentChangedEvent = EventToType<
  typeof VideoSectionContentChangedEvent
>;

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

export const SectionOrderChangedEvent = new DomainEvent("SectionOrderChanged", {
  order: Field.integer({
    isUnsigned: true,
  }),
  updatedBy: Field.uuid(),
});

export type SectionOrderChangedEvent = EventToType<
  typeof SectionOrderChangedEvent
>;

// Event streams for each section type
export const TextSectionEvents = [
  TextSectionAddedEvent,
  SectionTitleChangedEvent,
  TextSectionContentChangedEvent,
  SectionOrderChangedEvent,
] as const;

export const VideoSectionEvents = [
  VideoSectionAddedEvent,
  SectionTitleChangedEvent,
  VideoSectionContentChangedEvent,
  SectionOrderChangedEvent,
] as const;

export const QuestionnaireSectionEvents = [
  QuestionnaireSectionAddedEvent,
  SectionTitleChangedEvent,
  QuestionnaireSectionContentChangedEvent,
  SectionOrderChangedEvent,
] as const;

export const TextSectionStream = new EventStream(
  TextSectionModel.name,
  TextSectionEvents,
);
export const VideoSectionStream = new EventStream(
  VideoSectionModel.name,
  VideoSectionEvents,
);
export const QuestionnaireSectionStream = new EventStream(
  QuestionnaireSectionModel.name,
  QuestionnaireSectionEvents,
);

// Projectors for each section type
export const TextSectionProjector = new AggregateProjector(
  TextSectionStream.name,
  TextSectionModel,
  TextSectionEvents,
  {
    TextSectionAdded: (event): TextSection =>
      TextSectionModel.from(event, {
        title: event.payload.title,
        unitId: event.payload.unitId,
        order: event.payload.order,
        createdBy: event.payload.createdBy,
        content: event.payload.content,
      }),
    SectionTitleChanged: (event, section): TextSection =>
      TextSectionModel.update(section, event, {
        title: event.payload.title,
      }),
    TextSectionContentChanged: (event, section): TextSection =>
      TextSectionModel.update(section, event, {
        content: event.payload.content,
      }),
    SectionOrderChanged: (event, section): TextSection =>
      TextSectionModel.update(section, event, {
        order: event.payload.order,
      }),
  },
);

export const VideoSectionProjector = new AggregateProjector(
  VideoSectionStream.name,
  VideoSectionModel,
  VideoSectionEvents,
  {
    VideoSectionAdded: (event): VideoSection =>
      VideoSectionModel.from(event, {
        title: event.payload.title,
        unitId: event.payload.unitId,
        order: event.payload.order,
        createdBy: event.payload.createdBy,
        content: event.payload.content,
      }),
    SectionTitleChanged: (event, section): VideoSection =>
      VideoSectionModel.update(section, event, {
        title: event.payload.title,
      }),
    VideoSectionContentChanged: (event, section): VideoSection =>
      VideoSectionModel.update(section, event, {
        content: event.payload.content,
      }),
    SectionOrderChanged: (event, section): VideoSection =>
      VideoSectionModel.update(section, event, {
        order: event.payload.order,
      }),
  },
);

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
