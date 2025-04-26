import type { EventToType, Infer } from "@fabric/core";
import {
  AggregateModel,
  AggregateProjector,
  DomainEvent,
  EventStream,
  Field,
} from "@fabric/core";

// Define the Resource-Tag pivot model
export const ResourceTagModel = new AggregateModel("resource_tags", {
  resourceId: Field.reference({
    targetModel: "resources",
  }),
  tagId: Field.reference({
    targetModel: "tags",
  }),
  createdBy: Field.reference({
    targetModel: "users",
  }),
});

export type ResourceTagModel = typeof ResourceTagModel;
export type ResourceTag = Infer<ResourceTagModel>;

// Events
export const ResourceTagCreatedEvent = new DomainEvent("ResourceTagCreated", {
  resourceId: Field.uuid(),
  tagId: Field.uuid(),
  createdBy: Field.uuid(),
});

export type ResourceTagCreatedEvent = EventToType<
  typeof ResourceTagCreatedEvent
>;

export const ResourceTagRemovedEvent = new DomainEvent("ResourceTagRemoved", {
  removedBy: Field.uuid(),
});

export type ResourceTagRemovedEvent = EventToType<
  typeof ResourceTagRemovedEvent
>;

export const ResourceTagEvents = [
  ResourceTagCreatedEvent,
  ResourceTagRemovedEvent,
] as const;

export const ResourceTagStream = new EventStream(
  ResourceTagModel.name,
  ResourceTagEvents,
);

// Projector
export const ResourceTagProjector = new AggregateProjector(
  ResourceTagStream.name,
  ResourceTagModel,
  ResourceTagEvents,
  {
    ResourceTagCreated: (event): ResourceTag =>
      ResourceTagModel.from(event, event.payload),
    ResourceTagRemoved: () => {
      return null;
    },
  },
);
