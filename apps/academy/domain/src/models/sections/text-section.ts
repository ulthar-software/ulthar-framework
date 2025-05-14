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
} from "./section-base.js";

// Text Section Content Model
export const TextSectionContentModel = {
  text: Field.string({
    minLength: 1,
  }),
};
export type TextSectionContent = Infer<Schema<typeof TextSectionContentModel>>;

// Text Section Model
export const TextSectionModel = new AggregateModel("textSections", {
  ...BaseSectionFields,
  content: Field.embedded(TextSectionContentModel),
});

export type TextSectionModel = typeof TextSectionModel;
export type TextSection = Infer<TextSectionModel>;

// Text Section Added Event
export const TextSectionAddedEvent = new DomainEvent("TextSectionAdded", {
  ...BaseSectionAddedEvent,
  content: Field.embedded(TextSectionContentModel),
});

export type TextSectionAddedEvent = EventToType<typeof TextSectionAddedEvent>;

// Content-specific update events
export const TextSectionContentChangedEvent = new DomainEvent(
  "TextSectionContentChanged",
  {
    content: Field.embedded(TextSectionContentModel),
    updatedBy: Field.uuid(),
  },
);

export type TextSectionContentChangedEvent = EventToType<
  typeof TextSectionContentChangedEvent
>;

// Event streams for text section
export const TextSectionEvents = [
  TextSectionAddedEvent,
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
        unitId: event.payload.unitId,
        order: event.payload.order,
        createdBy: event.payload.createdBy,
        content: event.payload.content,
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
