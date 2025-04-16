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

export const CourseEvents = [CourseCreatedEvent] as const;

export const CourseStream = new EventStream(CourseModel.name, CourseEvents);

export const CourseProjector = new AggregateProjector(
  CourseStream.name,
  CourseModel,
  CourseEvents,
  {
    CourseCreated: (event): Course => CourseModel.from(event, event.payload),
  },
);
