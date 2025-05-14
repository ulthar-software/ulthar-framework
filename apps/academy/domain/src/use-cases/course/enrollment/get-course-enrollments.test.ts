import type { UUID } from "@fabric/core";
import { beforeEach, describe, expect, test } from "@fabric/testing";
import { createCourseMock } from "../../../models/mocks/create-course-mock.js";
import { createEnrollmentMock } from "../../../models/mocks/create-enrollment-mock.js";
import { createInvitationMock } from "../../../models/mocks/create-invitation-mock.js";
import { createUserMock } from "../../../models/mocks/create-user-mock.js";
import { Permission } from "../../../security/permission.js";
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
      users: [],
      userInvites: [],
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

    expect(result.users).toHaveLength(2);
    expect(result.users.map((u) => u.id)).toEqual(
      expect.arrayContaining([user1.id, user2.id]),
    );

    expect(result.userInvites).toHaveLength(2);
    expect(result.userInvites.map((i) => i.id)).toEqual(
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
});
