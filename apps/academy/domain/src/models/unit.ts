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

export const UnitNameChangedEvent = new DomainEvent("UnitNameChanged", {
  name: Field.string(),
  updatedBy: Field.uuid(),
});

export type UnitNameChangedEvent = EventToType<typeof UnitNameChangedEvent>;

export const UnitOrderChangedEvent = new DomainEvent("UnitOrderChanged", {
  order: Field.integer({
    isUnsigned: true,
  }),
  updatedBy: Field.uuid(),
});

export type UnitOrderChangedEvent = EventToType<typeof UnitOrderChangedEvent>;

export const UnitEvents = [
  UnitAddedEvent,
  UnitNameChangedEvent,
  UnitOrderChangedEvent,
] as const;

export const UnitStream = new EventStream(UnitModel.name, UnitEvents);

export const UnitProjector = new AggregateProjector(
  UnitStream.name,
  UnitModel,
  UnitEvents,
  {
    UnitAdded: (event): Unit => UnitModel.from(event, event.payload),
    UnitNameChanged: (event, unit): Unit =>
      UnitModel.update(unit, event, {
        name: event.payload.name,
      }),
    UnitOrderChanged: (event, unit): Unit =>
      UnitModel.update(unit, event, {
        order: event.payload.order,
      }),
  },
);
