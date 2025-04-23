import type { Effect, UUID, UnexpectedError } from "@fabric/core";
import { Field, Schema, TaggedError, type Infer } from "@fabric/core";
import { UserEnrolledEvent } from "../../../models/enrollment.js";
import { AccessPolicy } from "../../../security/access-policy.js";
import { Permission } from "../../../security/permission.js";
import type { UserAccess } from "../../../services/auth-service.js";
import type { DomainCryptoService } from "../../../services/crypto-service.js";
import type { DomainEventStore } from "../../../services/event-store.js";
import type { DomainStateStore } from "../../../services/state-store.js";
import { UseCase } from "../../../utils/use-case.js";
import { CourseNotFoundError } from "../errors.js";

export class StudentAlreadyEnrolledError extends TaggedError<"StudentAlreadyEnrolledError"> {
  constructor(
    public readonly userId: UUID,
    public readonly courseId: UUID,
  ) {
    super(
      "StudentAlreadyEnrolledError",
      `Student with ID ${userId} is already enrolled in course ${courseId}`,
    );
  }
}

export interface EnrollStudentInCourseDependencies {
  state: DomainStateStore;
  events: DomainEventStore;
  crypto: DomainCryptoService;
  currentUser: UserAccess;
}

export const EnrollStudentInCourseInputModel = new Schema({
  courseId: Field.uuid(),
  studentId: Field.uuid(),
});

export type EnrollStudentInCourseInput = Infer<
  typeof EnrollStudentInCourseInputModel
>;

export interface EnrollStudentInCourseOutput {
  enrollmentId: UUID;
}

export const EnrollStudentInCourseUseCase = new UseCase({
  name: "enrollStudentInCourse",
  type: "command",
  auth: AccessPolicy.WithPermission(Permission.ENROLL_STUDENTS),
  inputSchema: EnrollStudentInCourseInputModel,
  effect: (
    { state, events, crypto }: EnrollStudentInCourseDependencies,
    { courseId, studentId }: EnrollStudentInCourseInput,
  ): Effect<
    EnrollStudentInCourseOutput,
    CourseNotFoundError | StudentAlreadyEnrolledError | UnexpectedError
  > => {
    // First check if the course exists
    return state
      .from("courses")
      .where({ id: courseId })
      .selectOneOrFail()
      .mapError(() => new CourseNotFoundError(courseId))
      .flatMap(() => {
        // Check if student is already enrolled in this course
        return state
          .from("enrollments")
          .where({
            userId: studentId,
            courseId: courseId,
          })
          .assertNone()
          .mapError(() => new StudentAlreadyEnrolledError(studentId, courseId));
      })
      .flatMap(() => {
        // Create a new enrollment
        const enrollmentId = crypto.randomUUID();
        const eventId = crypto.randomUUID();

        const enrollmentEvent = UserEnrolledEvent.from({
          id: eventId,
          streamId: enrollmentId,
          payload: {
            userId: studentId,
            courseId: courseId,
          },
          version: 1n,
        });

        // Append the event to create the enrollment
        return events
          .append("enrollments", enrollmentEvent)
          .map(() => ({ enrollmentId }));
      });
  },
});
