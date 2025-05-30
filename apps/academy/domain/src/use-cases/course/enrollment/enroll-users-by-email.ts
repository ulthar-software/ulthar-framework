import type { CryptoService, Email, Infer, UUID } from "@fabric/core";
import {
  Effect,
  Field,
  Schema,
  TaggedError,
  UnexpectedError,
} from "@fabric/core";
import { UserEnrolledEvent } from "../../../models/enrollment.js";
import { UserInvitedEvent } from "../../../models/user-invite.js";
import { AccessPolicy } from "../../../security/access-policy.js";
import { Permission } from "../../../security/permission.js";
import { UserRole } from "../../../security/user-role.js";
import type { UserAccess } from "../../../services/auth-service.js";
import type { DomainEventStore } from "../../../services/event-store.js";
import type { DomainStateStore } from "../../../services/state-store.js";
import { UseCase } from "../../../utils/use-case.js";
import { CourseNotFoundError } from "../errors.js";

export class BatchEnrollmentFailedError extends TaggedError<"BatchEnrollmentFailedError"> {
  constructor(
    public readonly courseId: UUID,
    public readonly message: string,
  ) {
    super(
      "BatchEnrollmentFailedError",
      `Failed to enroll users in course ${courseId}: ${message}`,
    );
  }
}

export interface EnrollUsersByEmailDependencies {
  state: DomainStateStore;
  events: DomainEventStore;
  crypto: CryptoService;
  currentUser: UserAccess;
}

export const EnrollUsersByEmailInputModel = new Schema({
  courseId: Field.uuid(),
  emails: Field.array(Field.email()),
});

export type EnrollUsersByEmailInput = Infer<
  typeof EnrollUsersByEmailInputModel
>;

export type EnrollmentStatus =
  | "enrolled"
  | "invited_and_enrolled"
  | "already_enrolled";

export interface UserEnrollmentResult {
  email: string;
  status: EnrollmentStatus;
  userId?: UUID;
  inviteId?: UUID;
}

export interface EnrollUsersByEmailOutput {
  enrollmentResults: UserEnrollmentResult[];
}

export const EnrollUsersByEmailUseCase = new UseCase({
  name: "enrollUsersByEmail",
  type: "command",
  auth: AccessPolicy.WithPermission(
    Permission.ENROLL_STUDENTS,
    Permission.INVITE_USERS,
  ),
  inputSchema: EnrollUsersByEmailInputModel,
  effect: (
    { state, events, crypto }: EnrollUsersByEmailDependencies,
    { courseId, emails }: EnrollUsersByEmailInput,
  ): Effect<
    EnrollUsersByEmailOutput,
    CourseNotFoundError | BatchEnrollmentFailedError | UnexpectedError
  > => {
    // First check if the course exists
    return state
      .from("courses")
      .where({ id: courseId })
      .selectOneOrFail()
      .mapError(() => new CourseNotFoundError(courseId))
      .flatMap(() => {
        // Process each email
        return Effect.allInSequence(() =>
          emails.map((email) =>
            processEnrollmentForEmail(state, events, crypto, courseId, email),
          ),
        ).map((results) => ({
          enrollmentResults: results,
        }));
      });
  },
});

/**
 * Process enrollment for a single email address
 * This handles checking if the user exists, creating an invitation if needed,
 * and enrolling the user in the course.
 */
function processEnrollmentForEmail(
  state: DomainStateStore,
  events: DomainEventStore,
  crypto: CryptoService,
  courseId: UUID,
  email: Email,
): Effect<UserEnrollmentResult, UnexpectedError> {
  return findUserByEmail(state, email).flatMap((existingUser) => {
    if (existingUser.isValue()) {
      // User exists, check if already enrolled
      return checkIfAlreadyEnrolled(
        state,
        existingUser.value.id,
        courseId,
      ).flatMap((isEnrolled) => {
        if (isEnrolled) {
          // User already enrolled, return result
          return Effect.ok<UserEnrollmentResult>({
            email,
            status: "already_enrolled",
            userId: existingUser.value.id,
          });
        }
        // Enroll existing user
        return enrollUser(events, crypto, courseId, existingUser.value.id).map(
          () => ({
            email,
            status: "enrolled",
            userId: existingUser.value.id,
          }),
        );
      });
    } else {
      // User doesn't exist, check if they're already invited
      return findInvitationByEmail(state, email).flatMap(
        (existingInvitation) => {
          if (existingInvitation.isValue()) {
            // Invitation exists, use it to enroll
            return enrollByInvitationId(
              events,
              crypto,
              courseId,
              existingInvitation.value.id,
            ).map(() => ({
              email,
              status: "invited_and_enrolled" as const,
              inviteId: existingInvitation.value.id,
            }));
          }
          // Create invitation and then enroll
          return inviteAndEnrollUser(events, crypto, courseId, email);
        },
      );
    }
  });
}

/**
 * Find a user by email
 */
function findUserByEmail(state: DomainStateStore, email: Email) {
  return state
    .from("users")
    .where({ email })
    .selectOne()
    .mapError((e) => new UnexpectedError(e.message));
}

/**
 * Find an invitation by email
 */
function findInvitationByEmail(state: DomainStateStore, email: Email) {
  return state
    .from("userInvites")
    .where({ email })
    .selectOne()
    .mapError((e) => new UnexpectedError(e.message));
}

/**
 * Check if a user is already enrolled in a course
 */
function checkIfAlreadyEnrolled(
  state: DomainStateStore,
  userId: UUID,
  courseId: UUID,
): Effect<boolean, UnexpectedError> {
  return state
    .from("enrollments")
    .where({
      userId,
      courseId,
    })
    .selectOne()
    .mapError((e) => new UnexpectedError(e.message))
    .map((maybeEnrollment) => maybeEnrollment.isValue());
}

/**
 * Enroll a user in a course
 */
function enrollUser(
  events: DomainEventStore,
  crypto: CryptoService,
  courseId: UUID,
  userId: UUID,
): Effect<UUID, UnexpectedError> {
  const enrollmentId = crypto.randomUUID();
  const eventId = crypto.randomUUID();

  const enrollmentEvent = UserEnrolledEvent.from({
    id: eventId,
    streamId: enrollmentId,
    payload: {
      userId,
      courseId,
    },
    version: 1,
  });

  return events.append("enrollments", enrollmentEvent).map(() => enrollmentId);
}

/**
 * Enroll a user by invitation ID in a course
 */
function enrollByInvitationId(
  events: DomainEventStore,
  crypto: CryptoService,
  courseId: UUID,
  invitationId: UUID,
): Effect<UUID, UnexpectedError> {
  const enrollmentId = crypto.randomUUID();
  const eventId = crypto.randomUUID();

  const enrollmentEvent = UserEnrolledEvent.from({
    id: eventId,
    streamId: enrollmentId,
    payload: {
      userId: invitationId,
      courseId,
    },
    version: 1,
  });

  return events.append("enrollments", enrollmentEvent).map(() => enrollmentId);
}

/**
 * Create an invitation for a user and enroll them in a course
 */
function inviteAndEnrollUser(
  events: DomainEventStore,
  crypto: CryptoService,
  courseId: UUID,
  email: Email,
): Effect<UserEnrollmentResult, UnexpectedError> {
  // First create invitation
  const inviteId = crypto.randomUUID();
  const inviteCode = crypto.generateRandomToken(4);
  const inviteEventId = crypto.randomUUID();

  const inviteEvent = UserInvitedEvent.from({
    id: inviteEventId,
    streamId: inviteId,
    version: 1,
    payload: {
      email,
      role: UserRole.STUDENT,
      code: inviteCode,
    },
  });

  return events.append("userInvites", inviteEvent).flatMap(() => {
    // Then enroll by invitation
    return enrollByInvitationId(events, crypto, courseId, inviteId).map(() => ({
      email,
      status: "invited_and_enrolled" as const,
      inviteId,
    }));
  });
}
