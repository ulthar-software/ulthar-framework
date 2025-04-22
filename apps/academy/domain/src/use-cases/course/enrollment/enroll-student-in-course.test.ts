/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { UUID } from "@fabric/core";
import { beforeEach, describe, expect, test } from "@fabric/testing";
import { createUserMock } from "../../../models/mocks/create-user-mock.js";
import type { User } from "../../../models/user.js";
import { Permission } from "../../../security/permission.js";
import { UserRole } from "../../../security/user-role.js";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../../../services/mocks/create-mock-services.js";
import { UnauthorizedError } from "../../../utils/use-case.js";
import { CreateCourseUseCase } from "../create-course.js";
import { CourseNotFoundError } from "../errors.js";
import {
  EnrollStudentInCourseUseCase,
  StudentAlreadyEnrolledError,
} from "./enroll-student-in-course.js";

describe("Enroll Student In Course Use Case", () => {
  let services: MockedDependencies;
  let adminUser: User;
  let teacherUser: User;
  let studentUser: User;
  let existingCourseId: UUID;

  beforeEach(async () => {
    services = await createServiceMocks();

    // Create users with different roles
    adminUser = await createUserMock(services, {
      email: "admin@example.com",
      role: UserRole.ADMIN,
    });

    teacherUser = await createUserMock(services, {
      email: "teacher@example.com",
      role: UserRole.TEACHER,
    });

    studentUser = await createUserMock(services, {
      email: "student@example.com",
      role: UserRole.STUDENT,
    });

    // Create a test course
    const courseResult = await CreateCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: teacherUser.id,
          permissions: [Permission.CREATE_COURSE],
        },
      },
      {
        title: "Test Course",
        description: "A course for testing enrollment",
      },
    ).runOrThrow();

    existingCourseId = courseResult.courseId;
  });

  test("Admin should successfully enroll a student in a course", async () => {
    // Arrange
    const enrollmentData = {
      courseId: existingCourseId,
      studentId: studentUser.id,
    };

    // Act
    const result = await EnrollStudentInCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: adminUser.id,
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
        userId: studentUser.id,
        courseId: existingCourseId,
      })
      .selectOneOrFail()
      .runOrThrow();

    expect(enrollmentInDb).toEqual(
      expect.objectContaining({
        userId: studentUser.id,
        courseId: existingCourseId,
      }),
    );
  });

  test("Teacher should successfully enroll a student in a course", async () => {
    // Arrange
    const enrollmentData = {
      courseId: existingCourseId,
      studentId: studentUser.id,
    };

    // Act
    const result = await EnrollStudentInCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: teacherUser.id,
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
        userId: studentUser.id,
        courseId: existingCourseId,
      })
      .selectOneOrFail()
      .runOrThrow();

    expect(enrollmentInDb).toEqual(
      expect.objectContaining({
        userId: studentUser.id,
        courseId: existingCourseId,
      }),
    );
  });

  test("Should fail when trying to enroll a student in a non-existent course", async () => {
    // Arrange
    const nonExistentCourseId = "00000000-0000-0000-0000-000000000000";
    const enrollmentData = {
      courseId: nonExistentCourseId,
      studentId: studentUser.id,
    };

    // Act
    const result = await EnrollStudentInCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: adminUser.id,
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
      studentId: studentUser.id,
    };

    // First enrollment
    await EnrollStudentInCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: adminUser.id,
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
          id: adminUser.id,
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
      expect(error.userId).toBe(studentUser.id);
      expect(error.courseId).toBe(existingCourseId);
    }
  });

  test("Should fail when user doesn't have ENROLL_STUDENTS permission", async () => {
    // Arrange
    const enrollmentData = {
      courseId: existingCourseId,
      studentId: studentUser.id,
    };

    // Act
    const result = await EnrollStudentInCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: studentUser.id,
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
