import type { EventToType, Infer } from "@fabric/core";
import {
  AggregateModel,
  AggregateProjector,
  DomainEvent,
  EventStream,
  Field,
} from "@fabric/core";

// Define the Unit-Tag pivot model
export const UnitTagModel = new AggregateModel("unit_tags", {
  unitId: Field.reference({
    targetModel: "units",
  }),
  tagId: Field.reference({
    targetModel: "tags",
  }),
  createdBy: Field.reference({
    targetModel: "users",
  }),
});

export type UnitTagModel = typeof UnitTagModel;
export type UnitTag = Infer<UnitTagModel>;

// Events
export const UnitTagCreatedEvent = new DomainEvent("UnitTagCreated", {
  unitId: Field.uuid(),
  tagId: Field.uuid(),
  createdBy: Field.uuid(),
});

export type UnitTagCreatedEvent = EventToType<typeof UnitTagCreatedEvent>;

export const UnitTagRemovedEvent = new DomainEvent("UnitTagRemoved", {
  removedBy: Field.uuid(),
});

export type UnitTagRemovedEvent = EventToType<typeof UnitTagRemovedEvent>;

export const UnitTagEvents = [
  UnitTagCreatedEvent,
  UnitTagRemovedEvent,
] as const;

export const UnitTagStream = new EventStream(UnitTagModel.name, UnitTagEvents);

// Projector
export const UnitTagProjector = new AggregateProjector(
  UnitTagStream.name,
  UnitTagModel,
  UnitTagEvents,
  {
    UnitTagCreated: (event): UnitTag => UnitTagModel.from(event, event.payload),
    UnitTagRemoved: () => {
      return null;
    },
  },
);
