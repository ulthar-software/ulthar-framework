import type { UUID } from "@fabric/core";
import { beforeEach, describe, expect, test } from "@fabric/testing";
import { createCourseMock } from "../../../models/mocks/create-course-mock.js";
import { createEnrollmentMock } from "../../../models/mocks/create-enrollment-mock.js";
import { createInvitationMock } from "../../../models/mocks/create-invitation-mock.js";
import {
  createModuleMock,
  deleteModuleMock,
} from "../../../models/mocks/create-module-mock.js";
import { createQuestionnaireSectionMock } from "../../../models/mocks/create-questionnaire-section-mock.js";
import { createUnitMock } from "../../../models/mocks/create-unit-mock.js";
import { createUserMock } from "../../../models/mocks/create-user-mock.js";
import type { User } from "../../../models/user.js";
import { Permission } from "../../../security/permission.js";
import { UserRole } from "../../../security/user-role.js";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../../../services/mocks/create-mock-services.js";
import { mockUserAccess } from "../../../utils/mock-user-access.js";
import { UnauthorizedError } from "../../../utils/use-case.js";
import { AddQuestionnaireResponseUseCase } from "../add-questionnaire-response.js";
import { GetCourseEnrollmentsUseCase } from "./get-course-enrollments.js";

describe("Get Course Enrollments Use Case", () => {
  let services: MockedDependencies;
  let courseOwner: User;
  let courseId: UUID;
  let moduleId: UUID;
  let unitId: UUID;
  let quizId1: UUID;
  let quizId2: UUID;
  let testUser1: User;
  let testUser2: User;
  let testUser3: User;
  let testInviteId1: UUID;
  let testInviteId2: UUID;
  let testInviteId3: UUID;

  beforeEach(async () => {
    services = await createServiceMocks();

    // Create shared test data
    courseOwner = await createUserMock(services);
    courseId = await createCourseMock(services, courseOwner.id, {
      title: "Test Course",
      description: "A course for testing enrollments",
    });

    // Create course structure for quiz testing
    moduleId = await createModuleMock(services, courseOwner.id, courseId);
    unitId = await createUnitMock(services, courseOwner.id, moduleId);

    quizId1 = await createQuestionnaireSectionMock(
      services,
      courseOwner.id,
      unitId,
      {
        title: "Quiz 1",
      },
    );
    quizId2 = await createQuestionnaireSectionMock(
      services,
      courseOwner.id,
      unitId,
      {
        title: "Quiz 2",
      },
    );

    // Create test users with specific names for filtering tests
    testUser1 = await createUserMock(services, {
      firstName: "John",
      lastName: "Doe",
    });
    testUser2 = await createUserMock(services, {
      firstName: "Jane",
      lastName: "Smith",
    });
    testUser3 = await createUserMock(services, {
      firstName: "Bob",
      lastName: "Johnson",
    });

    // Create test invites with specific emails for filtering tests
    testInviteId1 = await createInvitationMock(services, {
      email: "john.doe@example.com",
      role: UserRole.STUDENT,
    });
    testInviteId2 = await createInvitationMock(services, {
      email: "jane.smith@example.com",
      role: UserRole.STUDENT,
    });
    testInviteId3 = await createInvitationMock(services, {
      email: "bob.johnson@example.com",
      role: UserRole.STUDENT,
    });
  });

  async function callUseCase(filter?: string) {
    return await GetCourseEnrollmentsUseCase.call(
      {
        state: services.state,
        currentUser: mockUserAccess(services, [Permission.ENROLL_STUDENTS]),
      },
      { courseId, ...(filter && { filter }) },
    ).runOrThrow();
  }

  async function callUseCaseWithoutPermission() {
    return await GetCourseEnrollmentsUseCase.call(
      {
        state: services.state,
        currentUser: mockUserAccess(services, []),
      },
      { courseId },
    ).run();
  }

  async function enrollUsersAndInvites() {
    await createEnrollmentMock(services, testUser1.id, courseId);
    await createEnrollmentMock(services, testUser2.id, courseId);
    await createEnrollmentMock(services, testUser3.id, courseId);
    await createEnrollmentMock(services, testInviteId1, courseId);
    await createEnrollmentMock(services, testInviteId2, courseId);
    await createEnrollmentMock(services, testInviteId3, courseId);
  }

  async function mockCorrectQuizResponse(
    questionnaireId: UUID,
    userId: UUID,
    version: number,
  ) {
    await AddQuestionnaireResponseUseCase.call(
      {
        ...services,
        currentUser: mockUserAccess(services, [], userId),
      },
      {
        questionnaireId,
        questionnaireVersion: version,
        answers: [0], // for default mock, assume 0 is correct
      },
    ).runOrThrow();
  }

  async function mockWrongQuizResponse(
    questionnaireId: UUID,
    userId: UUID,
    version: number,
  ) {
    await AddQuestionnaireResponseUseCase.call(
      {
        ...services,
        currentUser: mockUserAccess(services, [], userId),
      },
      {
        questionnaireId,
        questionnaireVersion: version,
        answers: [1], // for default mock, assume 1 is wrong
      },
    ).runOrThrow();
  }

  test("Should return empty lists when no enrollments exist", async () => {
    const result = await callUseCase();

    expect(result).toEqual({
      students: [],
      invites: [],
      totalQuizzes: 2,
    });
  });

  test("Should return enrolled users and invites", async () => {
    await enrollUsersAndInvites();

    const result = await callUseCase();

    expect(result.students).toHaveLength(3);
    expect(result.students.map((u) => u.id)).toEqual(
      expect.arrayContaining([testUser1.id, testUser2.id, testUser3.id]),
    );

    expect(result.invites).toHaveLength(3);
    expect(result.invites.map((i) => i.id)).toEqual(
      expect.arrayContaining([testInviteId1, testInviteId2, testInviteId3]),
    );
  });

  test("Should fail when user lacks ENROLL_STUDENTS permission", async () => {
    const result = await callUseCaseWithoutPermission();

    expect(result.isError()).toBe(true);
    const error = result.unwrapErrorOrThrow();
    expect(error).toBeInstanceOf(UnauthorizedError);
  });

  test("Should filter enrolled users by search term", async () => {
    await enrollUsersAndInvites();

    const result = await callUseCase("john");

    expect(result.students).toHaveLength(2);
    expect(result.students.map((u) => u.id)).toEqual(
      expect.arrayContaining([testUser1.id, testUser3.id]),
    );
  });

  test("Should filter user invites by search term", async () => {
    await enrollUsersAndInvites();

    const result = await callUseCase("john");

    expect(result.invites).toHaveLength(2);
    expect(result.invites.map((i) => i.id)).toEqual(
      expect.arrayContaining([testInviteId1, testInviteId3]),
    );
  });

  test("Should perform case-insensitive filtering", async () => {
    await enrollUsersAndInvites();

    const result = await callUseCase("JOHN");

    expect(result.students).toHaveLength(2);
    expect(result.students.map((u) => u.id)).toEqual(
      expect.arrayContaining([testUser1.id, testUser3.id]),
    );
    expect(result.invites).toHaveLength(2);
    expect(result.invites.map((i) => i.id)).toEqual(
      expect.arrayContaining([testInviteId1, testInviteId3]),
    );
  });

  test("Should return empty results when filter matches nothing", async () => {
    await enrollUsersAndInvites();

    const result = await callUseCase("nonexistent");

    expect(result.students).toHaveLength(0);
    expect(result.invites).toHaveLength(0);
  });

  test("Should return total quiz count in course", async () => {
    await enrollUsersAndInvites();

    const result = await callUseCase();

    expect(result.totalQuizzes).toBe(2);
  });

  test("Should include quiz results when students have completed quizzes", async () => {
    await createEnrollmentMock(services, testUser1.id, courseId);
    await createEnrollmentMock(services, testUser2.id, courseId);

    // User 1 completes both quizzes correctly
    await mockCorrectQuizResponse(quizId1, testUser1.id, 1);
    await mockCorrectQuizResponse(quizId2, testUser1.id, 1);

    // User 2 completes one quiz correctly, one incorrectly
    await mockCorrectQuizResponse(quizId1, testUser2.id, 1);
    await mockWrongQuizResponse(quizId2, testUser2.id, 1);

    const result = await callUseCase();

    expect(result.students).toHaveLength(2);
    expect(result.totalQuizzes).toBe(2);

    // Find users in results
    const user1Result = result.students.find((s) => s.id === testUser1.id);
    const user2Result = result.students.find((s) => s.id === testUser2.id);

    if (!user1Result || !user2Result) {
      throw new Error("Test users not found in results");
    }

    expect(user1Result.quizzesTried).toEqual(2);
    expect(user1Result.quizzesCompleted).toEqual(2);
    expect(user2Result.quizzesTried).toEqual(2);
    expect(user2Result.quizzesCompleted).toEqual(1);
  });

  test("should not include quiz results from deleted modules", async () => {
    await createEnrollmentMock(services, testUser1.id, courseId);
    await createEnrollmentMock(services, testUser2.id, courseId);

    // User 1 completes both quizzes correctly
    await mockCorrectQuizResponse(quizId1, testUser1.id, 1);
    await mockCorrectQuizResponse(quizId2, testUser1.id, 1);

    // User 2 completes one quiz correctly, one incorrectly
    await mockCorrectQuizResponse(quizId1, testUser2.id, 1);
    await mockWrongQuizResponse(quizId2, testUser2.id, 1);

    // Arrange - Delete the module
    await deleteModuleMock(services, courseOwner.id, moduleId);

    const result = await callUseCase();

    expect(result.students).toHaveLength(2);
    expect(result.totalQuizzes).toBe(0);

    // Find users in results
    const user1Result = result.students.find((s) => s.id === testUser1.id);
    const user2Result = result.students.find((s) => s.id === testUser2.id);

    if (!user1Result || !user2Result) {
      throw new Error("Test users not found in results");
    }

    expect(user1Result.quizzesTried).toEqual(0);
    expect(user1Result.quizzesCompleted).toEqual(0);
    expect(user2Result.quizzesTried).toEqual(0);
    expect(user2Result.quizzesCompleted).toEqual(0);
  });
});
