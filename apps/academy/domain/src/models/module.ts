import type { EventToType, Infer } from "@fabric/core";
import {
  AggregateModel,
  AggregateProjector,
  DomainEvent,
  EventStream,
  Field,
} from "@fabric/core";

export const ModuleModel = new AggregateModel("modules", {
  title: Field.string(),
  description: Field.string(),
  courseId: Field.reference({
    targetModel: "courses",
  }),
  order: Field.integer({
    isUnsigned: true,
  }),
  createdBy: Field.reference({
    targetModel: "users",
  }),
});

export type ModuleModel = typeof ModuleModel;
export type Module = Infer<ModuleModel>;

export const ModuleAddedEvent = new DomainEvent("ModuleAdded", {
  title: Field.string(),
  description: Field.string(),
  courseId: Field.uuid(),
  order: Field.integer({
    isUnsigned: true,
  }),
  createdBy: Field.uuid(),
});

export type ModuleAddedEvent = EventToType<typeof ModuleAddedEvent>;

export const ModuleUpdatedEvent = new DomainEvent("ModuleUpdated", {
  title: Field.string(),
  description: Field.string(),
  order: Field.integer({
    isUnsigned: true,
  }),
  updatedBy: Field.uuid(),
});

export type ModuleUpdatedEvent = EventToType<typeof ModuleUpdatedEvent>;

export const ModuleEvents = [ModuleAddedEvent, ModuleUpdatedEvent] as const;

export const ModuleStream = new EventStream(ModuleModel.name, ModuleEvents);

export const ModuleProjector = new AggregateProjector(
  ModuleStream.name,
  ModuleModel,
  ModuleEvents,
  {
    ModuleAdded: (event): Module => ModuleModel.from(event, event.payload),
    ModuleUpdated: (event, module): Module =>
      ModuleModel.update(module, event, {
        title: event.payload.title,
        description: event.payload.description,
        order: event.payload.order,
      }),
  },
);
