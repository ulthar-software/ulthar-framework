import { SchemaParsingError, type UUID } from "@fabric/core";
import { beforeEach, describe, expect, test } from "@fabric/testing";
import { createUserMock } from "../../models/mocks/create-user-mock.js";
import type { User } from "../../models/user.js";
import { Permission } from "../../security/permission.js";
import { UserRole } from "../../security/user-role.js";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../../services/mocks/create-mock-services.js";
import { UnauthorizedError } from "../../utils/use-case.js";
import { CreateCourseUseCase } from "./create-course.js";
import { CourseNotFoundError, EditCourseUseCase } from "./edit-course.js";

describe("Edit Course Use Case", () => {
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
        title: "Original Course Title",
        description: "Original course description",
      },
    ).runOrThrow();

    existingCourseId = courseResult.courseId;
  });

  test("Admin should successfully edit a course", async () => {
    // Arrange
    const updateData = {
      courseId: existingCourseId,
      title: "Updated Course Title",
      description: "Updated course description",
    };

    // Act
    await EditCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: adminUser.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      updateData,
    ).runOrThrow();

    // Verify the course was updated in the database
    const updatedCourse = await services.state
      .from("courses")
      .where({ id: existingCourseId })
      .selectOneOrFail()
      .runOrThrow();

    expect(updatedCourse).toEqual(
      expect.objectContaining({
        title: updateData.title,
        description: updateData.description,
      }),
    );
  });

  test("Teacher should successfully edit a course", async () => {
    // Arrange
    const updateData = {
      courseId: existingCourseId,
      title: "Teacher's Updated Title",
      description: "Updated by a teacher",
    };

    // Act
    await EditCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: teacherUser.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      updateData,
    ).runOrThrow();

    // Verify the course was updated in the database
    const updatedCourse = await services.state
      .from("courses")
      .where({ id: existingCourseId })
      .selectOneOrFail()
      .runOrThrow();

    expect(updatedCourse).toEqual(
      expect.objectContaining({
        title: updateData.title,
        description: updateData.description,
      }),
    );
  });

  test("Should fail when course doesn't exist", async () => {
    // Arrange
    const nonExistentCourseId = "00000000-0000-0000-0000-000000000000";
    const updateData = {
      courseId: nonExistentCourseId,
      title: "Updated Title",
      description: "Updated description",
    };

    // Act
    const result = await EditCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: adminUser.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      updateData,
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    const error = result.unwrapErrorOrThrow();
    expect(error).toBeInstanceOf(CourseNotFoundError);
  });

  test("Should fail when title is too short", async () => {
    // Arrange
    const updateData = {
      courseId: existingCourseId,
      title: "AB", // Too short (minLength: 3)
      description: "Updated description",
    };

    // Act
    const result = await EditCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: adminUser.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      updateData,
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    const error = result.unwrapErrorOrThrow();
    expect(error).toBeInstanceOf(SchemaParsingError);
  });

  test("Should fail when user doesn't have EDIT_COURSE permission", async () => {
    // Arrange
    const updateData = {
      courseId: existingCourseId,
      title: "Unauthorized Update",
      description: "This update should be rejected",
    };

    // Act
    const result = await EditCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: studentUser.id,
          permissions: [], // No permissions
        },
      },
      updateData,
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    const error = result.unwrapErrorOrThrow();
    expect(error).toBeInstanceOf(UnauthorizedError);
  });
});
