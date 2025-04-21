import type { EventToType } from "@fabric/core";
import {
  AggregateModel,
  AggregateProjector,
  DomainEvent,
  EventStream,
  Field,
  type Infer,
} from "@fabric/core";

// Define the Enrollment aggregate model
export const EnrollmentModel = new AggregateModel("enrollments", {
  userId: Field.reference({
    targetModel: "users",
  }),
  courseId: Field.reference({
    targetModel: "courses",
  }),
  active: Field.boolean(),
});

export type EnrollmentModel = typeof EnrollmentModel;
export type Enrollment = Infer<EnrollmentModel>;

// Event for when a user is enrolled in a course
export const UserEnrolledEvent = new DomainEvent("UserEnrolled", {
  userId: Field.uuid(),
  courseId: Field.uuid(),
});

export type UserEnrolledEvent = EventToType<typeof UserEnrolledEvent>;

export const EnrollmentEvents = [UserEnrolledEvent] as const;

export const EnrollmentStream = new EventStream(
  EnrollmentModel.name,
  EnrollmentEvents,
);

export const EnrollmentProjector = new AggregateProjector(
  EnrollmentStream.name,
  EnrollmentModel,
  EnrollmentEvents,
  {
    UserEnrolled: (event): Enrollment =>
      EnrollmentModel.from(event, {
        userId: event.payload.userId,
        courseId: event.payload.courseId,
        active: true,
      }),
  },
);
