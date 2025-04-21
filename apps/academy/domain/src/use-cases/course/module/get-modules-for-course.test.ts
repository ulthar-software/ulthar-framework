import type { UUID } from "@fabric/core";
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
import { CreateCourseUseCase } from "../create-course.js";
import { CourseNotFoundError, NotEnrolledInCourseError } from "../errors.js";
import { GetModulesForCourseUseCase } from "./get-modules-for-course.js";

describe("Get Modules For Course Use Case", () => {
  let services: MockedDependencies;
  let adminUser: User;
  let studentUser: User;

  beforeEach(async () => {
    services = await createServiceMocks();

    adminUser = await createUserMock(services, {
      email: "admin@example.com",
      role: UserRole.ADMIN,
    });

    studentUser = await createUserMock(services, {
      email: "student@example.com",
      role: UserRole.STUDENT,
    });
  });

  // Helper function to create an enrollment
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
      version: 1n,
    });

    await services.events.append("enrollments", enrollmentEvent).runOrThrow();
    return enrollmentId;
  }

  test("Admin should successfully get all modules for a course", async () => {
    // Arrange
    const [existingCourseId, moduleIds] = await createCourseMock(
      services,
      adminUser.id,
    );

    const queryData = {
      courseId: existingCourseId,
    };

    // Act
    const result = await GetModulesForCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: adminUser.id,
          permissions: [Permission.VIEW_COURSE],
        },
      },
      queryData,
    ).runOrThrow();

    // Assert
    expect(result.modules).toHaveLength(3);
    expect(result.modules.map((module) => module.id)).toEqual(
      expect.arrayContaining(moduleIds),
    );

    // Verify all modules belong to the requested course
    result.modules.forEach((module) => {
      expect(module.courseId).toBe(existingCourseId);
    });

    // Verify modules are ordered by order field
    const orderedModules = [...result.modules].sort(
      (a, b) => a.order - b.order,
    );
    expect(result.modules).toEqual(orderedModules);
  });

  test("Teacher should successfully get all modules for a course", async () => {
    // Arrange
    const [existingCourseId] = await createCourseMock(services, adminUser.id);
    const queryData = {
      courseId: existingCourseId,
    };

    // Act
    const result = await GetModulesForCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: adminUser.id,
          permissions: [Permission.VIEW_COURSE],
        },
      },
      queryData,
    ).runOrThrow();

    // Assert
    expect(result.modules).toHaveLength(3);
  });

  test("Enrolled student should successfully get all modules for a course", async () => {
    // Arrange
    const [existingCourseId] = await createCourseMock(services, adminUser.id);

    // Enroll the student in the course
    await enrollStudentInCourse(studentUser.id, existingCourseId);

    const queryData = {
      courseId: existingCourseId,
    };

    // Act
    const result = await GetModulesForCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: studentUser.id,
          permissions: [Permission.VIEW_COURSE],
        },
      },
      queryData,
    ).runOrThrow();

    // Assert
    expect(result.modules).toHaveLength(3);
  });

  test("Non-enrolled student should not be able to get modules for a course", async () => {
    // Arrange
    const [existingCourseId] = await createCourseMock(services, adminUser.id);

    // No enrollment created for this student

    const queryData = {
      courseId: existingCourseId,
    };

    // Act
    const result = await GetModulesForCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: studentUser.id,
          permissions: [],
        },
      },
      queryData,
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    const error = result.unwrapErrorOrThrow();
    if (!(error instanceof NotEnrolledInCourseError)) {
      throw new Error("Expected NotEnrolledInCourseError");
    }
    expect(error.userId).toBe(studentUser.id);
    expect(error.courseId).toBe(existingCourseId);
  });

  test("Should return empty array when course has no modules", async () => {
    // Arrange - Create a course with no modules
    const newCourseResult = await CreateCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: adminUser.id,
          permissions: [Permission.CREATE_COURSE],
        },
      },
      {
        title: "Empty Course",
        description: "A course with no modules",
      },
    ).runOrThrow();

    // Enroll the student in the course
    await enrollStudentInCourse(studentUser.id, newCourseResult.courseId);

    const queryData = {
      courseId: newCourseResult.courseId,
    };

    // Act
    const result = await GetModulesForCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: studentUser.id,
          permissions: [],
        },
      },
      queryData,
    ).runOrThrow();

    // Assert
    expect(result.modules).toHaveLength(0);
  });

  test("Should fail when course doesn't exist", async () => {
    // Arrange
    const nonExistentCourseId = "00000000-0000-0000-0000-000000000000";
    const queryData = {
      courseId: nonExistentCourseId,
    };

    // Act
    const result = await GetModulesForCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: studentUser.id,
          permissions: [Permission.VIEW_COURSE],
        },
      },
      queryData,
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    const error = result.unwrapErrorOrThrow();
    expect(error).toBeInstanceOf(CourseNotFoundError);
  });
});
