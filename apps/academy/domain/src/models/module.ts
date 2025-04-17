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

export const ModuleTitleChangedEvent = new DomainEvent("ModuleTitleChanged", {
  title: Field.string(),
  updatedBy: Field.uuid(),
});

export type ModuleTitleChangedEvent = EventToType<
  typeof ModuleTitleChangedEvent
>;

export const ModuleDescriptionChangedEvent = new DomainEvent(
  "ModuleDescriptionChanged",
  {
    description: Field.string(),
    updatedBy: Field.uuid(),
  },
);

export type ModuleDescriptionChangedEvent = EventToType<
  typeof ModuleDescriptionChangedEvent
>;

export const ModuleOrderChangedEvent = new DomainEvent("ModuleOrderChanged", {
  order: Field.integer({
    isUnsigned: true,
  }),
  updatedBy: Field.uuid(),
});

export type ModuleOrderChangedEvent = EventToType<
  typeof ModuleOrderChangedEvent
>;

export const ModuleEvents = [
  ModuleAddedEvent,
  ModuleTitleChangedEvent,
  ModuleDescriptionChangedEvent,
  ModuleOrderChangedEvent,
] as const;

export const ModuleStream = new EventStream(ModuleModel.name, ModuleEvents);

export const ModuleProjector = new AggregateProjector(
  ModuleStream.name,
  ModuleModel,
  ModuleEvents,
  {
    ModuleAdded: (event): Module => ModuleModel.from(event, event.payload),
    ModuleTitleChanged: (event, module): Module =>
      ModuleModel.update(module, event, {
        title: event.payload.title,
      }),
    ModuleDescriptionChanged: (event, module): Module =>
      ModuleModel.update(module, event, {
        description: event.payload.description,
      }),
    ModuleOrderChanged: (event, module): Module =>
      ModuleModel.update(module, event, {
        order: event.payload.order,
      }),
  },
);
