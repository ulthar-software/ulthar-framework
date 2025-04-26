import type { EventToType, Infer } from "@fabric/core";
import {
  AggregateModel,
  AggregateProjector,
  DomainEvent,
  EventStream,
  Field,
} from "@fabric/core";

export const ReferenceModel = new AggregateModel("references", {
  courseId: Field.reference({
    targetModel: "courses",
  }),
  title: Field.string(),
  description: Field.string(),
  url: Field.string(),
  createdBy: Field.reference({
    targetModel: "users",
  }),
});

export type ReferenceModel = typeof ReferenceModel;
export type Reference = Infer<ReferenceModel>;

export const ReferenceCreatedEvent = new DomainEvent("ReferenceCreated", {
  courseId: Field.uuid(),
  title: Field.string(),
  description: Field.string(),
  url: Field.string(),
  createdBy: Field.uuid(),
});

export type ReferenceCreatedEvent = EventToType<typeof ReferenceCreatedEvent>;

export const ReferenceTitleChangedEvent = new DomainEvent(
  "ReferenceTitleChanged",
  {
    title: Field.string(),
    updatedBy: Field.uuid(),
  },
);

export type ReferenceTitleChangedEvent = EventToType<
  typeof ReferenceTitleChangedEvent
>;

export const ReferenceDescriptionChangedEvent = new DomainEvent(
  "ReferenceDescriptionChanged",
  {
    description: Field.string(),
    updatedBy: Field.uuid(),
  },
);

export type ReferenceDescriptionChangedEvent = EventToType<
  typeof ReferenceDescriptionChangedEvent
>;

export const ReferenceUrlChangedEvent = new DomainEvent("ReferenceUrlChanged", {
  url: Field.string(),
  updatedBy: Field.uuid(),
});

export type ReferenceUrlChangedEvent = EventToType<
  typeof ReferenceUrlChangedEvent
>;

export const ReferenceEvents = [
  ReferenceCreatedEvent,
  ReferenceTitleChangedEvent,
  ReferenceDescriptionChangedEvent,
  ReferenceUrlChangedEvent,
] as const;

export const ReferenceStream = new EventStream(
  ReferenceModel.name,
  ReferenceEvents,
);

export const ReferenceProjector = new AggregateProjector(
  ReferenceStream.name,
  ReferenceModel,
  ReferenceEvents,
  {
    ReferenceCreated: (event): Reference =>
      ReferenceModel.from(event, event.payload),
    ReferenceTitleChanged: (event, reference): Reference =>
      ReferenceModel.update(reference, event, {
        title: event.payload.title,
      }),
    ReferenceDescriptionChanged: (event, reference): Reference =>
      ReferenceModel.update(reference, event, {
        description: event.payload.description,
      }),
    ReferenceUrlChanged: (event, reference): Reference =>
      ReferenceModel.update(reference, event, {
        url: event.payload.url,
      }),
  },
);
