import type { EnumToType, EventToType, Infer } from "@fabric/core";
import {
  AggregateModel,
  AggregateProjector,
  DomainEvent,
  EventStream,
  Field,
} from "@fabric/core";

export const SectionType = {
  TEXT: "TEXT",
  VIDEO: "VIDEO",
  QUESTIONNAIRE: "QUESTIONNAIRE",
} as const;

export const SectionTypeValues = Object.values(SectionType);

export type SectionType = EnumToType<typeof SectionType>;

export const SectionModel = new AggregateModel("sections", {
  title: Field.string(),
  type: Field.enum({
    values: SectionTypeValues,
  }),
  content: Field.string(),
  unitId: Field.reference({
    targetModel: "units",
  }),
  order: Field.integer({
    isUnsigned: true,
  }),
  createdBy: Field.reference({
    targetModel: "users",
  }),
});

export type SectionModel = typeof SectionModel;
export type Section = Infer<SectionModel>;

export const SectionAddedEvent = new DomainEvent("SectionAdded", {
  title: Field.string(),
  type: Field.enum({
    values: SectionTypeValues,
  }),
  content: Field.string(),
  unitId: Field.uuid(),
  order: Field.integer({
    isUnsigned: true,
  }),
  createdBy: Field.uuid(),
});

export type SectionAddedEvent = EventToType<typeof SectionAddedEvent>;

export const SectionTitleChangedEvent = new DomainEvent("SectionTitleChanged", {
  title: Field.string(),
  updatedBy: Field.uuid(),
});

export type SectionTitleChangedEvent = EventToType<
  typeof SectionTitleChangedEvent
>;

export const SectionTypeChangedEvent = new DomainEvent("SectionTypeChanged", {
  type: Field.enum({
    values: SectionTypeValues,
  }),
  content: Field.string(), // Content will be updated when type changes
  updatedBy: Field.uuid(),
});

export type SectionTypeChangedEvent = EventToType<
  typeof SectionTypeChangedEvent
>;

export const SectionContentChangedEvent = new DomainEvent(
  "SectionContentChanged",
  {
    content: Field.string(),
    updatedBy: Field.uuid(),
  },
);

export type SectionContentChangedEvent = EventToType<
  typeof SectionContentChangedEvent
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

export const SectionEvents = [
  SectionAddedEvent,
  SectionTitleChangedEvent,
  SectionTypeChangedEvent,
  SectionContentChangedEvent,
  SectionOrderChangedEvent,
] as const;

export const SectionStream = new EventStream(SectionModel.name, SectionEvents);

export const SectionProjector = new AggregateProjector(
  SectionStream.name,
  SectionModel,
  SectionEvents,
  {
    SectionAdded: (event): Section => SectionModel.from(event, event.payload),
    SectionTitleChanged: (event, section): Section =>
      SectionModel.update(section, event, {
        title: event.payload.title,
      }),
    SectionTypeChanged: (event, section): Section =>
      SectionModel.update(section, event, {
        type: event.payload.type,
        content: event.payload.content,
      }),
    SectionContentChanged: (event, section): Section =>
      SectionModel.update(section, event, {
        content: event.payload.content,
      }),
    SectionOrderChanged: (event, section): Section =>
      SectionModel.update(section, event, {
        order: event.payload.order,
      }),
  },
);
