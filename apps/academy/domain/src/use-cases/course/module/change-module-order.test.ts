import { SchemaParsingError, type UUID } from "@fabric/core";
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
import { ModuleNotFoundError } from "../errors.js";
import { AddModuleToCourseUseCase } from "./add-module-to-course.js";
import { ChangeModuleOrderUseCase } from "./change-module-order.js";

describe("Change Module Order Use Case", () => {
  let services: MockedDependencies;
  let adminUser: User;
  let teacherUser: User;
  let studentUser: User;
  let existingCourseId: UUID;
  let existingModuleId: UUID;

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
        description: "Test course description",
      },
    ).runOrThrow();

    existingCourseId = courseResult.courseId;

    // Add a module to the course
    const moduleResult = await AddModuleToCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: teacherUser.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      {
        courseId: existingCourseId,
        title: "Original Module Title",
        description: "Original module description",
      },
    ).runOrThrow();

    existingModuleId = moduleResult.moduleId;
  });

  test("Admin should successfully change module order", async () => {
    // Arrange
    const updateData = {
      moduleId: existingModuleId,
      order: 300,
    };

    // Act
    await ChangeModuleOrderUseCase.call(
      {
        ...services,
        currentUser: {
          id: adminUser.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      updateData,
    ).runOrThrow();

    // Verify the module was updated in the database
    const updatedModule = await services.state
      .from("modules")
      .where({ id: existingModuleId })
      .selectOneOrFail()
      .runOrThrow();

    expect(updatedModule).toEqual(
      expect.objectContaining({
        order: updateData.order,
      }),
    );
  });

  test("Teacher should successfully change module order", async () => {
    // Arrange
    const updateData = {
      moduleId: existingModuleId,
      order: 250,
    };

    // Act
    await ChangeModuleOrderUseCase.call(
      {
        ...services,
        currentUser: {
          id: teacherUser.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      updateData,
    ).runOrThrow();

    // Verify the module was updated in the database
    const updatedModule = await services.state
      .from("modules")
      .where({ id: existingModuleId })
      .selectOneOrFail()
      .runOrThrow();

    expect(updatedModule).toEqual(
      expect.objectContaining({
        order: updateData.order,
      }),
    );
  });

  test("Should fail when module doesn't exist", async () => {
    // Arrange
    const nonExistentModuleId = "00000000-0000-0000-0000-000000000000";
    const updateData = {
      moduleId: nonExistentModuleId,
      order: 200,
    };

    // Act
    const result = await ChangeModuleOrderUseCase.call(
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
    expect(error).toBeInstanceOf(ModuleNotFoundError);
  });

  test("Should fail when order is negative", async () => {
    // Arrange
    const updateData = {
      moduleId: existingModuleId,
      order: -100,
    };

    // Act
    const result = await ChangeModuleOrderUseCase.call(
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
      moduleId: existingModuleId,
      order: 400,
    };

    // Act
    const result = await ChangeModuleOrderUseCase.call(
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
