import type { EnumToType, EventToType, Infer } from "@fabric/core";
import {
  AggregateModel,
  AggregateProjector,
  DomainEvent,
  EventStream,
  Field,
} from "@fabric/core";

// For categorizing resources, we'll define resource types
export const ResourceType = {
  REQUIRED_READING: "REQUIRED_READING",
  RECOMMENDED_READING: "RECOMMENDED_READING",
  VIDEO: "VIDEO",
  CONCEPT: "CONCEPT",
  DOCUMENTATION: "DOCUMENTATION",
  BLOG: "BLOG",
  TUTORIAL: "TUTORIAL",
  TOOL: "TOOL",
} as const;

export const ResourceTypeValues = Object.values(ResourceType);
export type ResourceType = EnumToType<typeof ResourceType>;

export const ResourceModel = new AggregateModel("resources", {
  courseId: Field.reference({
    targetModel: "courses",
  }),
  title: Field.string(),
  description: Field.string(),
  url: Field.string(),
  type: Field.enum({
    values: ResourceTypeValues,
  }),
  createdBy: Field.reference({
    targetModel: "users",
  }),
});

export type ResourceModel = typeof ResourceModel;
export type Resource = Infer<ResourceModel>;

export const ResourceCreatedEvent = new DomainEvent("ResourceCreated", {
  courseId: Field.uuid(),
  title: Field.string(),
  description: Field.string(),
  url: Field.string(),
  type: Field.enum({
    values: ResourceTypeValues,
  }),
  createdBy: Field.uuid(),
});

export type ResourceCreatedEvent = EventToType<typeof ResourceCreatedEvent>;

export const ResourceEditedEvent = new DomainEvent("ResourceEdited", {
  title: Field.string(),
  description: Field.string(),
  url: Field.string(),
  updatedBy: Field.uuid(),
});
export type ResourceEditedEvent = EventToType<typeof ResourceEditedEvent>;

export const ResourceDeletedEvent = new DomainEvent("ResourceDeleted", {});
export type ResourceDeletedEvent = EventToType<typeof ResourceDeletedEvent>;

export const ResourceEvents = [
  ResourceCreatedEvent,
  ResourceEditedEvent,
  ResourceDeletedEvent,
] as const;

export const ResourceStream = new EventStream(
  ResourceModel.name,
  ResourceEvents,
);

export const ResourceProjector = new AggregateProjector(
  ResourceStream.name,
  ResourceModel,
  ResourceEvents,
  {
    ResourceCreated: (event): Resource =>
      ResourceModel.from(event, event.payload),
    ResourceEdited: (event, resource): Resource => {
      return ResourceModel.update(resource, event, {
        courseId: resource.courseId,
        title: event.payload.title,
        description: event.payload.description,
        url: event.payload.url,
      });
    },
    ResourceDeleted: () => null,
  },
);
