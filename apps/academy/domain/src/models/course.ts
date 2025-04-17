import type { EventToType, Infer } from "@fabric/core";
import {
  AggregateModel,
  AggregateProjector,
  DomainEvent,
  EventStream,
  Field,
} from "@fabric/core";

export const CourseModel = new AggregateModel("courses", {
  title: Field.string(),
  description: Field.string(),
  createdBy: Field.reference({
    targetModel: "users",
  }),
});

export type CourseModel = typeof CourseModel;
export type Course = Infer<CourseModel>;

export const CourseCreatedEvent = new DomainEvent("CourseCreated", {
  title: Field.string(),
  description: Field.string(),
  createdBy: Field.uuid(),
});

export type CourseCreatedEvent = EventToType<typeof CourseCreatedEvent>;

export const CourseTitleChangedEvent = new DomainEvent("CourseTitleChanged", {
  title: Field.string(),
  updatedBy: Field.uuid(),
});

export type CourseTitleChangedEvent = EventToType<
  typeof CourseTitleChangedEvent
>;

export const CourseDescriptionChangedEvent = new DomainEvent(
  "CourseDescriptionChanged",
  {
    description: Field.string(),
    updatedBy: Field.uuid(),
  },
);

export type CourseDescriptionChangedEvent = EventToType<
  typeof CourseDescriptionChangedEvent
>;

export const CourseEvents = [
  CourseCreatedEvent,
  CourseTitleChangedEvent,
  CourseDescriptionChangedEvent,
] as const;

export const CourseStream = new EventStream(CourseModel.name, CourseEvents);

export const CourseProjector = new AggregateProjector(
  CourseStream.name,
  CourseModel,
  CourseEvents,
  {
    CourseCreated: (event): Course => CourseModel.from(event, event.payload),
    CourseTitleChanged: (event, course): Course =>
      CourseModel.update(course, event, {
        title: event.payload.title,
      }),
    CourseDescriptionChanged: (event, course): Course =>
      CourseModel.update(course, event, {
        description: event.payload.description,
      }),
  },
);
