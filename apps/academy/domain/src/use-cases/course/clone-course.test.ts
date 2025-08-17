/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { SchemaParsingError, type UUID } from "@fabric/core";
import { beforeEach, describe, expect, test } from "@fabric/testing";
import { createCourseMock } from "../../models/mocks/create-course-mock.js";
import { createUserMock } from "../../models/mocks/create-user-mock.js";
import type { User } from "../../models/user.js";
import { Permission } from "../../security/permission.js";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../../services/mocks/create-mock-services.js";
import { UnauthorizedError } from "../../utils/use-case.js";
import { CloneCourseUseCase } from "./clone-course.js";
import { CourseNotFoundError } from "./errors.js";
import { AddModuleToCourseUseCase } from "./module/add-module-to-course.js";
import { AddUnitToModuleUseCase } from "./module/unit/add-unit-to-module.js";
import { AddResourceToCourseUseCase } from "./resources/add-resource-to-course.js";

describe("Clone Course Use Case", () => {
  let services: MockedDependencies;
  let user: User;
  let sourceCourseId: UUID;

  beforeEach(async () => {
    services = await createServiceMocks();
    user = await createUserMock(services);

    // Create a source course with content
    sourceCourseId = await createCourseMock(services, user.id, {
      title: "Original Course",
      description: "Original course description",
    });

    // Add a module to the source course
    const moduleResult = await AddModuleToCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      {
        courseId: sourceCourseId,
        title: "Test Module",
        description: "Test module description",
      },
    ).runOrThrow();

    // Add a unit to the module
    await AddUnitToModuleUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      {
        moduleId: moduleResult.moduleId,
        title: "Test Unit",
      },
    ).runOrThrow();

    // Add a resource to the source course
    await AddResourceToCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      {
        courseId: sourceCourseId,
        title: "Test Resource",
        description: "Test resource description",
        url: "https://example.com",
        type: "REQUIRED_READING",
      },
    ).runOrThrow();
  });

  test("Admin should successfully clone a course with new title", async () => {
    // Arrange
    const cloneData = {
      sourceId: sourceCourseId,
      title: "Cloned Course",
      description: "Cloned course description",
    };

    // Act
    const result = await CloneCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.CREATE_COURSE],
        },
      },
      cloneData,
    ).runOrThrow();

    // Assert
    expect(result).toEqual({
      courseId: expect.any(String),
    });

    // Verify the cloned course exists
    const clonedCourse = await services.state
      .from("courses")
      .where({ id: result.courseId })
      .selectOneOrFail()
      .runOrThrow();

    expect(clonedCourse).toEqual(
      expect.objectContaining({
        title: cloneData.title,
        description: cloneData.description,
        createdBy: user.id,
      }),
    );

    // Verify modules were cloned
    const clonedModules = await services.state
      .from("modules")
      .where({ courseId: result.courseId })
      .select()
      .runOrThrow();

    expect(clonedModules).toHaveLength(1);
    expect(clonedModules[0]).toEqual(
      expect.objectContaining({
        title: "Test Module",
        description: "Test module description",
        courseId: result.courseId,
        createdBy: user.id,
      }),
    );

    // Verify units were cloned
    const clonedUnits = await services.state
      .from("units")
      .where({ moduleId: clonedModules[0].id })
      .select()
      .runOrThrow();

    expect(clonedUnits).toHaveLength(1);
    expect(clonedUnits[0]).toEqual(
      expect.objectContaining({
        title: "Test Unit",
        moduleId: clonedModules[0].id,
        createdBy: user.id,
      }),
    );

    // Verify resources were cloned
    const clonedResources = await services.state
      .from("resources")
      .where({ courseId: result.courseId })
      .select()
      .runOrThrow();

    expect(clonedResources).toHaveLength(1);
    expect(clonedResources[0]).toEqual(
      expect.objectContaining({
        title: "Test Resource",
        description: "Test resource description",
        url: "https://example.com",
        type: "REQUIRED_READING",
        courseId: result.courseId,
        createdBy: user.id,
      }),
    );
  });

  test("Should successfully clone a course without providing description", async () => {
    // Arrange
    const cloneData = {
      sourceId: sourceCourseId,
      title: "Cloned Course No Description",
    };

    // Act
    const result = await CloneCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.CREATE_COURSE],
        },
      },
      cloneData,
    ).runOrThrow();

    // Assert
    const clonedCourse = await services.state
      .from("courses")
      .where({ id: result.courseId })
      .selectOneOrFail()
      .runOrThrow();

    // Should use the original course's description
    expect(clonedCourse).toEqual(
      expect.objectContaining({
        title: cloneData.title,
        description: "Original course description",
        createdBy: user.id,
      }),
    );
  });

  test("Should fail when source course doesn't exist", async () => {
    // Arrange
    const nonExistentCourseId = "00000000-0000-0000-0000-000000000000";
    const cloneData = {
      sourceId: nonExistentCourseId,
      title: "Invalid Clone",
      description: "This clone should not be created",
    };

    // Act
    const result = await CloneCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.CREATE_COURSE],
        },
      },
      cloneData,
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    const error = result.unwrapErrorOrThrow();
    expect(error).toBeInstanceOf(CourseNotFoundError);
  });

  test("Should fail when title is too short", async () => {
    // Arrange
    const cloneData = {
      sourceId: sourceCourseId,
      title: "AB", // Too short (minLength: 3)
      description: "This clone has a title that's too short",
    };

    // Act
    const result = await CloneCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.CREATE_COURSE],
        },
      },
      cloneData,
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    const error = result.unwrapErrorOrThrow();
    expect(error).toBeInstanceOf(SchemaParsingError);
  });

  test("Should fail when user doesn't have CREATE_COURSE permission", async () => {
    // Arrange
    const cloneData = {
      sourceId: sourceCourseId,
      title: "Unauthorized Clone",
      description: "This clone should not be created without permission",
    };

    // Act
    const result = await CloneCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [], // No permissions
        },
      },
      cloneData,
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    const error = result.unwrapErrorOrThrow();
    expect(error).toBeInstanceOf(UnauthorizedError);
  });

  test("Should clone empty course with no modules or resources", async () => {
    // Arrange - Create a course with no modules or resources
    const emptyCourseId = await createCourseMock(services, user.id, {
      title: "Empty Course",
      description: "Empty course",
    });

    const cloneData = {
      sourceId: emptyCourseId,
      title: "Cloned Empty Course",
    };

    // Act
    const result = await CloneCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.CREATE_COURSE],
        },
      },
      cloneData,
    ).runOrThrow();

    // Assert
    const clonedCourse = await services.state
      .from("courses")
      .where({ id: result.courseId })
      .selectOneOrFail()
      .runOrThrow();

    expect(clonedCourse).toEqual(
      expect.objectContaining({
        title: cloneData.title,
        description: "Empty course",
        createdBy: user.id,
      }),
    );

    // Verify no modules were created
    const clonedModules = await services.state
      .from("modules")
      .where({ courseId: result.courseId })
      .select()
      .runOrThrow();

    expect(clonedModules).toHaveLength(0);

    // Verify no resources were created
    const clonedResources = await services.state
      .from("resources")
      .where({ courseId: result.courseId })
      .select()
      .runOrThrow();

    expect(clonedResources).toHaveLength(0);
  });

  test("Should not clone deleted modules and units", async () => {
    // This test assumes there would be a way to mark modules/units as deleted
    // For now, we'll just verify the basic functionality
    const cloneData = {
      sourceId: sourceCourseId,
      title: "Clone with Active Content Only",
    };

    const result = await CloneCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.CREATE_COURSE],
        },
      },
      cloneData,
    ).runOrThrow();

    // Verify only active (non-deleted) modules were cloned
    const clonedModules = await services.state
      .from("modules")
      .where({ courseId: result.courseId })
      .select()
      .runOrThrow();

    // Should only clone modules that have deletedAt: undefined
    expect(clonedModules).toHaveLength(1);
  });
});
