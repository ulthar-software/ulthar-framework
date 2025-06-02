import type { EventToType } from "@fabric/core";
import {
  AggregateModel,
  AggregateProjector,
  DomainEvent,
  EventStream,
  Field,
  uniqueModelConstraint,
  type Infer,
} from "@fabric/core";

// Define the Enrollment aggregate model
export const EnrollmentModel = new AggregateModel(
  "enrollments",
  {
    userId: Field.uuid(), //This is not a reference because a userId can be a reference to an invited user that has not been created yet
    courseId: Field.reference({
      targetModel: "courses",
    }),
  },
  {
    constraints: [uniqueModelConstraint(["userId", "courseId"])],
  },
);

export type EnrollmentModel = typeof EnrollmentModel;
export type Enrollment = Infer<EnrollmentModel>;

export const UserEnrolledEvent = new DomainEvent("UserEnrolled", {
  userId: Field.uuid(),
  courseId: Field.uuid(),
});
export type UserEnrolledEvent = EventToType<typeof UserEnrolledEvent>;

export const UserUnenrolledEvent = new DomainEvent("UserUnenrolled", {
  unenrolledBy: Field.uuid(),
});
export type UserUnenrolledEvent = EventToType<typeof UserUnenrolledEvent>;

export const EnrollmentEvents = [
  UserEnrolledEvent,
  UserUnenrolledEvent,
] as const;

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
      }),
    UserUnenrolled: () => null,
  },
);
