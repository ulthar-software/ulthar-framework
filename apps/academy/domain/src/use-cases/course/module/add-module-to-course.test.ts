/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { SchemaParsingError, type UUID } from "@fabric/core";
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
import { AddModuleToCourseUseCase } from "./add-module-to-course.js";

describe("Add Module To Course Use Case", () => {
  let services: MockedDependencies;
  let user: User;
  let existingCourseId: UUID;

  beforeEach(async () => {
    services = await createServiceMocks();

    // Create users with different roles
    user = await createUserMock(services);

    // Create a test course
    existingCourseId = await createCourseMock(services, user.id, {
      title: "Original Course Title",
      description: "Original course description",
    });
  });

  test("Admin should successfully add a module to a course", async () => {
    // Arrange
    const moduleData = {
      courseId: existingCourseId,
      title: "Introduction Module",
      description: "Getting started with the course",
    };

    // Act
    const result = await AddModuleToCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      moduleData,
    ).runOrThrow();

    // Assert
    expect(result).toEqual({
      moduleId: expect.any(String),
    });

    // Verify the module was added to the database
    const moduleInDb = await services.state
      .from("modules")
      .where({ id: result.moduleId })
      .selectOneOrFail()
      .runOrThrow();

    expect(moduleInDb).toEqual(
      expect.objectContaining({
        title: moduleData.title,
        description: moduleData.description,
        courseId: existingCourseId,
        order: 100, // First module should have order 100
        createdBy: user.id,
      }),
    );
  });

  test("Adding multiple modules should increment the order by 100", async () => {
    // Arrange - Add a first module
    await AddModuleToCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      {
        courseId: existingCourseId,
        title: "First Module",
        description: "The first module",
      },
    ).runOrThrow();

    // Add a second module
    const secondModuleData = {
      courseId: existingCourseId,
      title: "Second Module",
      description: "The second module",
    };

    // Act
    const result = await AddModuleToCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      secondModuleData,
    ).runOrThrow();

    // Assert
    const secondModule = await services.state
      .from("modules")
      .where({ id: result.moduleId })
      .selectOneOrFail()
      .runOrThrow();

    expect(secondModule).toEqual(
      expect.objectContaining({
        order: 200, // Second module should have order 200
      }),
    );
  });

  test("Should fail when course doesn't exist", async () => {
    // Arrange
    const nonExistentCourseId = "00000000-0000-0000-0000-000000000000";
    const moduleData = {
      courseId: nonExistentCourseId,
      title: "Invalid Module",
      description: "This module should not be created",
    };

    // Act
    const result = await AddModuleToCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      moduleData,
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    const error = result.unwrapErrorOrThrow();
    expect(error).toBeInstanceOf(CourseNotFoundError);
  });

  test("Should fail when title is too short", async () => {
    // Arrange
    const moduleData = {
      courseId: existingCourseId,
      title: "AB", // Too short (minLength: 3)
      description: "This module has a title that's too short",
    };

    // Act
    const result = await AddModuleToCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      moduleData,
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    const error = result.unwrapErrorOrThrow();
    expect(error).toBeInstanceOf(SchemaParsingError);
  });

  test("Should successfully add a module without a description", async () => {
    // Arrange
    const moduleData = {
      courseId: existingCourseId,
      title: "Module Without Description",
      // No description provided
    };

    // Act
    const result = await AddModuleToCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      moduleData,
    ).runOrThrow();

    // Assert
    expect(result).toEqual({
      moduleId: expect.any(String),
    });

    // Verify the module was added to the database
    const moduleInDb = await services.state
      .from("modules")
      .where({ id: result.moduleId })
      .selectOneOrFail()
      .runOrThrow();

    expect(moduleInDb).toEqual(
      expect.objectContaining({
        title: moduleData.title,
        description: "", // Description should be an empty string
        courseId: existingCourseId,
        createdBy: user.id,
      }),
    );
  });

  test("Should fail when user doesn't have EDIT_COURSE permission", async () => {
    // Arrange
    const moduleData = {
      courseId: existingCourseId,
      title: "Unauthorized Module",
      description: "This module should not be created without permission",
    };

    // Act
    const result = await AddModuleToCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [], // No permissions
        },
      },
      moduleData,
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    const error = result.unwrapErrorOrThrow();
    expect(error).toBeInstanceOf(UnauthorizedError);
  });
});
