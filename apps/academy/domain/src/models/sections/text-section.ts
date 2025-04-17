import type { EventToType, Infer } from "@fabric/core";
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

// Text Section Content Model
export const TextSectionContentModel = {
  text: Field.string({
    minLength: 1,
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

// Text Section Added Event
export const TextSectionAddedEvent = new DomainEvent("TextSectionAdded", {
  ...BaseSectionAddedEvent,
  content: Field.embedded({
    subModel: TextSectionContentModel,
  }),
});

export type TextSectionAddedEvent = EventToType<typeof TextSectionAddedEvent>;

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

// Event streams for text section
export const TextSectionEvents = [
  TextSectionAddedEvent,
  SectionTitleChangedEvent,
  TextSectionContentChangedEvent,
  SectionOrderChangedEvent,
] as const;

export const TextSectionStream = new EventStream(
  TextSectionModel.name,
  TextSectionEvents,
);

// Projector for text section
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
