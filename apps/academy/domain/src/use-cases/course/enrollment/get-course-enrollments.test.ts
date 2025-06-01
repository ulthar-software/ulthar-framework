import type { UUID } from "@fabric/core";
import { beforeEach, describe, expect, test } from "@fabric/testing";
import { createCourseMock } from "../../../models/mocks/create-course-mock.js";
import { createEnrollmentMock } from "../../../models/mocks/create-enrollment-mock.js";
import { createInvitationMock } from "../../../models/mocks/create-invitation-mock.js";
import { createUserMock } from "../../../models/mocks/create-user-mock.js";
import { Permission } from "../../../security/permission.js";
import { UserRole } from "../../../security/user-role.js";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../../../services/mocks/create-mock-services.js";
import { mockUserAccess } from "../../../utils/mock-user-access.js";
import { GetCourseEnrollmentsUseCase } from "./get-course-enrollments.js";

describe("Get Course Enrollments Use Case", () => {
  let services: MockedDependencies;
  let courseId: UUID;

  beforeEach(async () => {
    services = await createServiceMocks();

    // Create a test course
    const user = await createUserMock(services);
    courseId = await createCourseMock(services, user.id, {
      title: "Test Course",
      description: "A course for testing enrollments",
    });
  });

  test("Should return empty lists when no enrollments exist", async () => {
    const result = await GetCourseEnrollmentsUseCase.call(
      {
        state: services.state,
        currentUser: mockUserAccess(services, [Permission.ENROLL_STUDENTS]),
      },
      { courseId },
    ).runOrThrow();

    expect(result).toEqual({
      students: [],
      invites: [],
      totalQuizzes: 0,
    });
  });

  test("Should return enrolled users and invites", async () => {
    // Create users and enroll them
    const user1 = await createUserMock(services);
    const user2 = await createUserMock(services);

    await createEnrollmentMock(services, user1.id, courseId);
    await createEnrollmentMock(services, user2.id, courseId);

    // Create user invites
    const inviteId1 = await createInvitationMock(services);
    const inviteId2 = await createInvitationMock(services);

    await createEnrollmentMock(services, inviteId1, courseId);
    await createEnrollmentMock(services, inviteId2, courseId);

    const result = await GetCourseEnrollmentsUseCase.call(
      {
        state: services.state,
        currentUser: mockUserAccess(services, [Permission.ENROLL_STUDENTS]),
      },
      { courseId },
    ).runOrThrow();

    expect(result.students).toHaveLength(2);
    expect(result.students.map((u) => u.id)).toEqual(
      expect.arrayContaining([user1.id, user2.id]),
    );

    expect(result.invites).toHaveLength(2);
    expect(result.invites.map((i) => i.id)).toEqual(
      expect.arrayContaining([inviteId1, inviteId2]),
    );
  });

  test("Should fail when user lacks ENROLL_STUDENTS permission", async () => {
    const result = await GetCourseEnrollmentsUseCase.call(
      {
        state: services.state,
        currentUser: mockUserAccess(services, []),
      },
      { courseId },
    ).run();

    expect(result.isError()).toBe(true);
    const error = result.unwrapErrorOrThrow();
    expect(error.name).toBe("UnauthorizedError");
  });

  test("Should filter enrolled users by search term", async () => {
    // Create users with specific names
    const user1 = await createUserMock(services, {
      firstName: "John",
      lastName: "Doe",
    });
    const user2 = await createUserMock(services, {
      firstName: "Jane",
      lastName: "Smith",
    });
    const user3 = await createUserMock(services, {
      firstName: "Bob",
      lastName: "Johnson",
    });

    await createEnrollmentMock(services, user1.id, courseId);
    await createEnrollmentMock(services, user2.id, courseId);
    await createEnrollmentMock(services, user3.id, courseId);

    const result = await GetCourseEnrollmentsUseCase.call(
      {
        state: services.state,
        currentUser: mockUserAccess(services, [Permission.ENROLL_STUDENTS]),
      },
      { courseId, filter: "john" },
    ).runOrThrow();

    expect(result.students).toHaveLength(2);
    expect(result.students.map((u) => u.id)).toEqual(
      expect.arrayContaining([user1.id, user3.id]),
    );
  });

  test("Should filter user invites by search term", async () => {
    // Create invites with specific emails
    const inviteId1 = await createInvitationMock(services, {
      email: "john.doe@example.com",
      role: UserRole.STUDENT,
    });
    const inviteId2 = await createInvitationMock(services, {
      email: "jane.smith@example.com",
      role: UserRole.STUDENT,
    });
    const inviteId3 = await createInvitationMock(services, {
      email: "bob.johnson@example.com",
      role: UserRole.STUDENT,
    });

    await createEnrollmentMock(services, inviteId1, courseId);
    await createEnrollmentMock(services, inviteId2, courseId);
    await createEnrollmentMock(services, inviteId3, courseId);

    const result = await GetCourseEnrollmentsUseCase.call(
      {
        state: services.state,
        currentUser: mockUserAccess(services, [Permission.ENROLL_STUDENTS]),
      },
      { courseId, filter: "john" },
    ).runOrThrow();

    expect(result.invites).toHaveLength(2);
    expect(result.invites.map((i) => i.id)).toEqual(
      expect.arrayContaining([inviteId1, inviteId3]),
    );
  });

  test("Should perform case-insensitive filtering", async () => {
    const user = await createUserMock(services, {
      firstName: "Alice",
      lastName: "Wonder",
    });
    await createEnrollmentMock(services, user.id, courseId);

    const inviteId = await createInvitationMock(services, {
      email: "alice.wonder@example.com",
      role: UserRole.STUDENT,
    });
    await createEnrollmentMock(services, inviteId, courseId);

    const result = await GetCourseEnrollmentsUseCase.call(
      {
        state: services.state,
        currentUser: mockUserAccess(services, [Permission.ENROLL_STUDENTS]),
      },
      { courseId, filter: "ALICE" },
    ).runOrThrow();

    expect(result.students).toHaveLength(1);
    expect(result.students[0].id).toBe(user.id);
    expect(result.invites).toHaveLength(1);
    expect(result.invites[0].id).toBe(inviteId);
  });

  test("Should return empty results when filter matches nothing", async () => {
    const user = await createUserMock(services, {
      firstName: "Test",
      lastName: "User",
    });
    await createEnrollmentMock(services, user.id, courseId);

    const inviteId = await createInvitationMock(services, {
      email: "test@example.com",
      role: UserRole.STUDENT,
    });
    await createEnrollmentMock(services, inviteId, courseId);

    const result = await GetCourseEnrollmentsUseCase.call(
      {
        state: services.state,
        currentUser: mockUserAccess(services, [Permission.ENROLL_STUDENTS]),
      },
      { courseId, filter: "nonexistent" },
    ).runOrThrow();

    expect(result.students).toHaveLength(0);
    expect(result.invites).toHaveLength(0);
  });

  test("Should return all results when no filter is provided", async () => {
    const user = await createUserMock(services, {
      firstName: "Test",
      lastName: "User",
    });
    await createEnrollmentMock(services, user.id, courseId);

    const inviteId = await createInvitationMock(services, {
      email: "test@example.com",
      role: UserRole.STUDENT,
    });
    await createEnrollmentMock(services, inviteId, courseId);

    const result = await GetCourseEnrollmentsUseCase.call(
      {
        state: services.state,
        currentUser: mockUserAccess(services, [Permission.ENROLL_STUDENTS]),
      },
      { courseId },
    ).runOrThrow();

    expect(result.students).toHaveLength(1);
    expect(result.invites).toHaveLength(1);
  });
});
