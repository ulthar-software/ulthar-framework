import type { EventToType, Infer } from "@fabric/core";
import {
  AggregateModel,
  AggregateProjector,
  DomainEvent,
  EventStream,
  Field,
} from "@fabric/core";

export const TagModel = new AggregateModel("tags", {
  name: Field.string(),
  createdBy: Field.reference({
    targetModel: "users",
  }),
});

export type TagModel = typeof TagModel;
export type Tag = Infer<TagModel>;

export const TagCreatedEvent = new DomainEvent("TagCreated", {
  name: Field.string(),
  createdBy: Field.uuid(),
});

export type TagCreatedEvent = EventToType<typeof TagCreatedEvent>;

export const TagNameChangedEvent = new DomainEvent("TagNameChanged", {
  name: Field.string(),
  updatedBy: Field.uuid(),
});

export type TagNameChangedEvent = EventToType<typeof TagNameChangedEvent>;

export const TagEvents = [TagCreatedEvent, TagNameChangedEvent] as const;

export const TagStream = new EventStream(TagModel.name, TagEvents);

export const TagProjector = new AggregateProjector(
  TagStream.name,
  TagModel,
  TagEvents,
  {
    TagCreated: (event): Tag => TagModel.from(event, event.payload),
    TagNameChanged: (event, tag): Tag =>
      TagModel.update(tag, event, {
        name: event.payload.name,
      }),
  },
);
