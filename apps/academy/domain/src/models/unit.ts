import type { EventToType, Infer } from "@fabric/core";
import {
  AggregateModel,
  AggregateProjector,
  DomainEvent,
  EventStream,
  Field,
} from "@fabric/core";

export const UnitModel = new AggregateModel("units", {
  name: Field.string(),
  moduleId: Field.reference({
    targetModel: "modules",
  }),
  order: Field.integer({
    isUnsigned: true,
  }),
  createdBy: Field.reference({
    targetModel: "users",
  }),
});

export type UnitModel = typeof UnitModel;
export type Unit = Infer<UnitModel>;

export const UnitAddedEvent = new DomainEvent("UnitAdded", {
  name: Field.string(),
  moduleId: Field.uuid(),
  order: Field.integer({
    isUnsigned: true,
  }),
  createdBy: Field.uuid(),
});

export type UnitAddedEvent = EventToType<typeof UnitAddedEvent>;

export const UnitUpdatedEvent = new DomainEvent("UnitUpdated", {
  name: Field.string(),
  order: Field.integer({
    isUnsigned: true,
  }),
  updatedBy: Field.uuid(),
});

export type UnitUpdatedEvent = EventToType<typeof UnitUpdatedEvent>;

export const UnitEvents = [UnitAddedEvent, UnitUpdatedEvent] as const;

export const UnitStream = new EventStream(UnitModel.name, UnitEvents);

export const UnitProjector = new AggregateProjector(
  UnitStream.name,
  UnitModel,
  UnitEvents,
  {
    UnitAdded: (event): Unit => UnitModel.from(event, event.payload),
    UnitUpdated: (event, unit): Unit =>
      UnitModel.update(unit, event, {
        name: event.payload.name,
        order: event.payload.order,
      }),
  },
);
