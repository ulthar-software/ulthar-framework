/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { Email } from "@fabric/core";
import { isIn, type UUID } from "@fabric/core";
import { beforeEach, describe, expect, test } from "@fabric/testing";
import { UserEnrolledEvent } from "../../../models/enrollment.js";
import { createCourseMock } from "../../../models/mocks/create-course-mock.js";
import { createUserMock } from "../../../models/mocks/create-user-mock.js";
import type { User } from "../../../models/user.js";
import { Permission } from "../../../security/permission.js";
import { UserRole } from "../../../security/user-role.js";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../../../services/mocks/create-mock-services.js";
import { UnauthorizedError } from "../../../utils/use-case.js";
import { CourseNotFoundError } from "../errors.js";
import { EnrollUsersByEmailUseCase } from "./enroll-users-by-email.js";

describe("Enroll Users By Email Use Case", () => {
  let services: MockedDependencies;
  let user: User;
  let existingCourseId: UUID;

  beforeEach(async () => {
    services = await createServiceMocks();

    // Create a teacher user
    user = await createUserMock(services, {
      role: UserRole.TEACHER,
    });

    // Create a test course
    existingCourseId = await createCourseMock(services, user.id, {
      title: "Test Course",
      description: "A course for testing enrollment",
    });
  });

  test("Should successfully enroll existing users by their email", async () => {
    // Create some existing users
    const user1 = await createUserMock(services, {
      email: "user1@example.com",
      role: UserRole.STUDENT,
    });
    const user2 = await createUserMock(services, {
      email: "user2@example.com",
      role: UserRole.STUDENT,
    });

    // Act
    const result = await EnrollUsersByEmailUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.ENROLL_STUDENTS, Permission.INVITE_USERS],
        },
      },
      {
        courseId: existingCourseId,
        emails: ["user1@example.com", "user2@example.com"],
      },
    ).runOrThrow();

    // Assert
    expect(result).toEqual({
      enrollmentResults: [
        {
          email: "user1@example.com",
          status: "enrolled",
          userId: user1.id,
        },
        {
          email: "user2@example.com",
          status: "enrolled",
          userId: user2.id,
        },
      ],
    });

    // Verify enrollments in database
    const enrollments = await services.state
      .from("enrollments")
      .where({
        courseId: existingCourseId,
      })
      .select()
      .runOrThrow();

    expect(enrollments).toHaveLength(2);
    expect(enrollments.map((e) => e.userId)).toEqual(
      expect.arrayContaining([user1.id, user2.id]),
    );
  });

  test("Should create invitations for non-existing users and enroll them", async () => {
    // Act - enrolling non-existing users
    const result = await EnrollUsersByEmailUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.ENROLL_STUDENTS, Permission.INVITE_USERS],
        },
      },
      {
        courseId: existingCourseId,
        emails: ["new1@example.com", "new2@example.com"],
      },
    ).runOrThrow();

    // Assert - invitations were created and users were enrolled
    expect(result.enrollmentResults).toHaveLength(2);
    expect(result.enrollmentResults.map((r) => r.status)).toEqual([
      "invited_and_enrolled",
      "invited_and_enrolled",
    ]);

    // Verify invitations were created
    const invitations = await services.state
      .from("userInvites")
      .where({
        email: isIn(["new1@example.com", "new2@example.com"]),
      })
      .select()
      .runOrThrow();

    expect(invitations).toHaveLength(2);

    // Verify enrollments were created
    const enrollments = await services.state
      .from("enrollments")
      .select()
      .runOrThrow();

    // Two enrollments should exist, one for each invitation
    expect(enrollments).toHaveLength(2);
  });

  test("Should handle a mix of existing and non-existing users", async () => {
    // Create one existing user
    const existingUser = await createUserMock(services, {
      email: "existing@example.com",
      role: UserRole.STUDENT,
    });

    // Act - enrolling a mix of existing and new users
    const result = await EnrollUsersByEmailUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.ENROLL_STUDENTS, Permission.INVITE_USERS],
        },
      },
      {
        courseId: existingCourseId,
        emails: ["existing@example.com", "new3@example.com"],
      },
    ).runOrThrow();

    // Assert
    expect(result.enrollmentResults).toHaveLength(2);
    expect(result.enrollmentResults).toEqual(
      expect.arrayContaining([
        {
          email: "existing@example.com",
          status: "enrolled",
          userId: existingUser.id,
        },
        {
          email: "new3@example.com",
          status: "invited_and_enrolled",
          inviteId: expect.any(String),
        },
      ]),
    );

    // Verify the enrollment for existing user
    const existingUserEnrollment = await services.state
      .from("enrollments")
      .where({
        userId: existingUser.id,
        courseId: existingCourseId,
      })
      .selectOne()
      .runOrThrow();

    expect(existingUserEnrollment.isValue()).toBe(true);

    // Verify the invitation and enrollment for the new user
    const newUserInvitation = await services.state
      .from("userInvites")
      .where({
        email: "new3@example.com",
      })
      .selectOne()
      .runOrThrow();

    expect(newUserInvitation.isValue()).toBe(true);
  });

  test("Should not duplicate enrollments for users already enrolled", async () => {
    // Create a user and enroll them first
    const preEnrolledUser = await createUserMock(services, {
      email: "preenrolled@example.com",
      role: UserRole.STUDENT,
    });

    // Helper function to properly create an enrollment
    async function enrollStudentInCourse(userId: UUID, courseId: UUID) {
      const enrollmentId = services.crypto.randomUUID();
      const eventId = services.crypto.randomUUID();

      const enrollmentEvent = UserEnrolledEvent.from({
        id: eventId,
        streamId: enrollmentId,
        payload: {
          userId,
          courseId,
        },
        version: 1,
      });

      await services.events.append("enrollments", enrollmentEvent).runOrThrow();
      return enrollmentId;
    }

    // Pre-enroll the user
    await enrollStudentInCourse(preEnrolledUser.id, existingCourseId);

    // Act - try to enroll them again
    const result = await EnrollUsersByEmailUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.ENROLL_STUDENTS, Permission.INVITE_USERS],
        },
      },
      {
        courseId: existingCourseId,
        emails: ["preenrolled@example.com"],
      },
    ).runOrThrow();

    // Assert
    expect(result.enrollmentResults).toHaveLength(1);
    expect(result.enrollmentResults[0]).toEqual({
      email: "preenrolled@example.com",
      status: "already_enrolled",
      userId: preEnrolledUser.id,
    });
  });

  test("Should fail when the course doesn't exist", async () => {
    // Act
    const result = await EnrollUsersByEmailUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.ENROLL_STUDENTS, Permission.INVITE_USERS],
        },
      },
      {
        courseId: "00000000-0000-0000-0000-000000000000",
        emails: ["test@example.com"],
      },
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    const error = result.unwrapErrorOrThrow();
    expect(error).toBeInstanceOf(CourseNotFoundError);
  });

  test("Should fail when user doesn't have required permissions", async () => {
    // Act - trying to enroll without permissions
    const result = await EnrollUsersByEmailUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [], // No permissions
        },
      },
      {
        courseId: existingCourseId,
        emails: ["test@example.com"],
      },
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    const error = result.unwrapErrorOrThrow();
    expect(error).toBeInstanceOf(UnauthorizedError);
  });

  test("should work with 100 emails", async () => {
    // Create 100 emails
    const emails: Email[] = Array.from(
      { length: 100 },
      (_, i) => `email${i}@example.com` as Email,
    );
    // Act

    const result = await EnrollUsersByEmailUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.ENROLL_STUDENTS, Permission.INVITE_USERS],
        },
      },
      {
        courseId: existingCourseId,
        emails,
      },
    ).runOrThrow();

    // Assert
    expect(result.enrollmentResults).toHaveLength(100);
    expect(result.enrollmentResults.map((r) => r.status)).toEqual(
      Array(100).fill("invited_and_enrolled"),
    );
    expect(result.enrollmentResults.map((r) => r.email)).toEqual(emails);
    // Verify invitations were created
    const invitations = await services.state
      .from("userInvites")
      .where({
        email: isIn(emails),
      })
      .select()
      .runOrThrow();
    expect(invitations).toHaveLength(100);
    // Verify enrollments were created

    const enrollments = await services.state
      .from("enrollments")
      .where({
        courseId: existingCourseId,
        userId: isIn(invitations.map((i) => i.id)),
      })
      .select()
      .runOrThrow();
    expect(enrollments).toHaveLength(100);
    expect(enrollments.map((e) => e.userId)).toEqual(
      expect.arrayContaining(invitations.map((i) => i.id)),
    );
  });
});
