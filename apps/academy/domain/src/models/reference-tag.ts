import type { EventToType, Infer } from "@fabric/core";
import {
  AggregateModel,
  AggregateProjector,
  DomainEvent,
  EventStream,
  Field,
} from "@fabric/core";

// Define the Reference-Tag pivot model
export const ReferenceTagModel = new AggregateModel("reference_tags", {
  referenceId: Field.reference({
    targetModel: "references",
  }),
  tagId: Field.reference({
    targetModel: "tags",
  }),
  createdBy: Field.reference({
    targetModel: "users",
  }),
});

export type ReferenceTagModel = typeof ReferenceTagModel;
export type ReferenceTag = Infer<ReferenceTagModel>;

// Events
export const ReferenceTagCreatedEvent = new DomainEvent("ReferenceTagCreated", {
  referenceId: Field.uuid(),
  tagId: Field.uuid(),
  createdBy: Field.uuid(),
});

export type ReferenceTagCreatedEvent = EventToType<
  typeof ReferenceTagCreatedEvent
>;

export const ReferenceTagRemovedEvent = new DomainEvent("ReferenceTagRemoved", {
  removedBy: Field.uuid(),
});

export type ReferenceTagRemovedEvent = EventToType<
  typeof ReferenceTagRemovedEvent
>;

export const ReferenceTagEvents = [
  ReferenceTagCreatedEvent,
  ReferenceTagRemovedEvent,
] as const;

export const ReferenceTagStream = new EventStream(
  ReferenceTagModel.name,
  ReferenceTagEvents,
);

// Projector
export const ReferenceTagProjector = new AggregateProjector(
  ReferenceTagStream.name,
  ReferenceTagModel,
  ReferenceTagEvents,
  {
    ReferenceTagCreated: (event): ReferenceTag =>
      ReferenceTagModel.from(event, event.payload),
    ReferenceTagRemoved: () => {
      return null;
    },
  },
);
