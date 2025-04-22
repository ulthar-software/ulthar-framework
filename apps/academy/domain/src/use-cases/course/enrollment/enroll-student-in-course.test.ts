/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { UUID } from "@fabric/core";
import { beforeEach, describe, expect, test } from "@fabric/testing";
import { createCourseMock } from "../../../models/mocks/create-course-mock.js";
import { createUserMock } from "../../../models/mocks/create-user-mock.js";
import type { User } from "../../../models/user.js";
import { Permission } from "../../../security/permission.js";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../../../services/mocks/create-mock-services.js";
import { UnauthorizedError } from "../../../utils/use-case.js";
import { CourseNotFoundError } from "../errors.js";
import {
  EnrollStudentInCourseUseCase,
  StudentAlreadyEnrolledError,
} from "./enroll-student-in-course.js";

describe("Enroll Student In Course Use Case", () => {
  let services: MockedDependencies;
  let user: User;
  let existingCourseId: UUID;

  beforeEach(async () => {
    services = await createServiceMocks();

    // Create users with different roles
    user = await createUserMock(services);

    // Create a test course
    existingCourseId = await createCourseMock(services, user.id, {
      title: "Test Course",
      description: "A course for testing enrollment",
    });
  });

  test("Admin should successfully enroll a student in a course", async () => {
    // Arrange
    const enrollmentData = {
      courseId: existingCourseId,
      studentId: user.id,
    };

    // Act
    const result = await EnrollStudentInCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.ENROLL_STUDENTS],
        },
      },
      enrollmentData,
    ).runOrThrow();

    // Assert
    expect(result).toEqual({
      enrollmentId: expect.any(String),
    });

    // Verify the enrollment was added to the database
    const enrollmentInDb = await services.state
      .from("enrollments")
      .where({
        userId: user.id,
        courseId: existingCourseId,
      })
      .selectOneOrFail()
      .runOrThrow();

    expect(enrollmentInDb).toEqual(
      expect.objectContaining({
        userId: user.id,
        courseId: existingCourseId,
      }),
    );
  });

  test("Teacher should successfully enroll a student in a course", async () => {
    // Arrange
    const enrollmentData = {
      courseId: existingCourseId,
      studentId: user.id,
    };

    // Act
    const result = await EnrollStudentInCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.ENROLL_STUDENTS],
        },
      },
      enrollmentData,
    ).runOrThrow();

    // Assert
    expect(result).toEqual({
      enrollmentId: expect.any(String),
    });

    // Verify the enrollment was added to the database
    const enrollmentInDb = await services.state
      .from("enrollments")
      .where({
        userId: user.id,
        courseId: existingCourseId,
      })
      .selectOneOrFail()
      .runOrThrow();

    expect(enrollmentInDb).toEqual(
      expect.objectContaining({
        userId: user.id,
        courseId: existingCourseId,
      }),
    );
  });

  test("Should fail when trying to enroll a student in a non-existent course", async () => {
    // Arrange
    const nonExistentCourseId = "00000000-0000-0000-0000-000000000000";
    const enrollmentData = {
      courseId: nonExistentCourseId,
      studentId: user.id,
    };

    // Act
    const result = await EnrollStudentInCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.ENROLL_STUDENTS],
        },
      },
      enrollmentData,
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    const error = result.unwrapErrorOrThrow();
    expect(error).toBeInstanceOf(CourseNotFoundError);
  });

  test("Should fail when trying to enroll a student who is already enrolled", async () => {
    // Arrange
    const enrollmentData = {
      courseId: existingCourseId,
      studentId: user.id,
    };

    // First enrollment
    await EnrollStudentInCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.ENROLL_STUDENTS],
        },
      },
      enrollmentData,
    ).runOrThrow();

    // Act - Second enrollment attempt
    const result = await EnrollStudentInCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.ENROLL_STUDENTS],
        },
      },
      enrollmentData,
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    const error = result.unwrapErrorOrThrow();
    expect(error).toBeInstanceOf(StudentAlreadyEnrolledError);
    if (error instanceof StudentAlreadyEnrolledError) {
      expect(error.userId).toBe(user.id);
      expect(error.courseId).toBe(existingCourseId);
    }
  });

  test("Should fail when user doesn't have ENROLL_STUDENTS permission", async () => {
    // Arrange
    const enrollmentData = {
      courseId: existingCourseId,
      studentId: user.id,
    };

    // Act
    const result = await EnrollStudentInCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [], // No permissions
        },
      },
      enrollmentData,
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    const error = result.unwrapErrorOrThrow();
    expect(error).toBeInstanceOf(UnauthorizedError);
  });
});
