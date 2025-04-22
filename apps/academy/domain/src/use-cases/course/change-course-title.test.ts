import { SchemaParsingError, type UUID } from "@fabric/core";
import { beforeEach, describe, expect, test } from "@fabric/testing";
import { createCourseMock } from "../../models/mocks/create-course-mock.js";
import { createUserMock } from "../../models/mocks/create-user-mock.js";
import type { User } from "../../models/user.js";
import { Permission } from "../../security/permission.js";
import { UserRole } from "../../security/user-role.js";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../../services/mocks/create-mock-services.js";
import { UnauthorizedError } from "../../utils/use-case.js";
import { ChangeCourseTitleUseCase } from "./change-course-title.js";
import { CourseNotFoundError } from "./errors.js";

describe("Change Course Title Use Case", () => {
  let services: MockedDependencies;
  let user: User;
  let existingCourseId: UUID;

  beforeEach(async () => {
    services = await createServiceMocks();

    // Create users with different roles
    user = await createUserMock(services, {
      email: "admin@example.com",
      role: UserRole.ADMIN,
    });

    // Create a test course
    existingCourseId = await createCourseMock(services, user.id, {
      title: "Original Course Title",
      description: "Original course description",
    });
  });

  test("Admin should successfully change course title", async () => {
    // Arrange
    const updateData = {
      courseId: existingCourseId,
      title: "Updated Course Title",
    };

    // Act
    await ChangeCourseTitleUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
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
        description: "Original course description", // Description should remain unchanged
      }),
    );
  });

  test("Should fail when course doesn't exist", async () => {
    // Arrange
    const nonExistentCourseId = "00000000-0000-0000-0000-000000000000";
    const updateData = {
      courseId: nonExistentCourseId,
      title: "Updated Title",
    };

    // Act
    const result = await ChangeCourseTitleUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
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
    };

    // Act
    const result = await ChangeCourseTitleUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
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
    };

    // Act
    const result = await ChangeCourseTitleUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
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
