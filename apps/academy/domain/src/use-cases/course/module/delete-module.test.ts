import type { UUID } from "@fabric/core";
import { beforeEach, describe, expect, test } from "@fabric/testing";
import { createCourseMock } from "../../../models/mocks/create-course-mock.js";
import { createModuleMock } from "../../../models/mocks/create-module-mock.js";
import { createUserMock } from "../../../models/mocks/create-user-mock.js";
import type { User } from "../../../models/user.js";
import { Permission } from "../../../security/permission.js";
import { UserRole } from "../../../security/user-role.js";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../../../services/mocks/create-mock-services.js";
import { UnauthorizedError } from "../../../utils/use-case.js";
import { ModuleNotFoundError } from "../errors.js";
import { DeleteModuleUseCase } from "./delete-module.js";

describe("Delete Module Use Case", () => {
  let services: MockedDependencies;
  let user: User;
  let existingModuleId: UUID;
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
      title: "Test Course",
      description: "A course for testing module deletion",
    });

    // Add a module to the course
    existingModuleId = await createModuleMock(
      services,
      user.id,
      existingCourseId,
      {
        title: "Module to Delete",
        description: "This module will be deleted",
      },
    );
  });

  test("Admin should successfully delete a module", async () => {
    // Arrange
    const deleteData = {
      moduleId: existingModuleId,
    };

    // Act
    await DeleteModuleUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      deleteData,
    ).runOrThrow();

    // Verify the module was soft-deleted in the database
    const deletedModule = await services.state
      .from("modules")
      .where({ id: existingModuleId })
      .selectOneOrFail()
      .runOrThrow();

    expect(deletedModule).toEqual(
      expect.objectContaining({
        title: "Module to Delete",
        description: "This module will be deleted",
      }),
    );

    // Check that deletedAt is a PosixDate with a timestamp
    expect(deletedModule.deletedAt).toBeDefined();
    expect(deletedModule.deletedAt?.timestamp).toEqual(expect.any(Number));
  });

  test("Deleting an already deleted module should succeed (idempotent)", async () => {
    // Arrange - First delete the module
    const deleteData = {
      moduleId: existingModuleId,
    };

    await DeleteModuleUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      deleteData,
    ).runOrThrow();

    // Act - Delete the same module again
    await DeleteModuleUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      deleteData,
    ).runOrThrow();

    // Verify the module is still deleted
    const deletedModule = await services.state
      .from("modules")
      .where({ id: existingModuleId })
      .selectOneOrFail()
      .runOrThrow();

    expect(deletedModule.deletedAt).toBeDefined();
    expect(deletedModule.deletedAt?.timestamp).toEqual(expect.any(Number));
  });

  test("Should fail when module doesn't exist", async () => {
    // Arrange
    const nonExistentModuleId = "00000000-0000-0000-0000-000000000000";
    const deleteData = {
      moduleId: nonExistentModuleId,
    };

    // Act
    const result = await DeleteModuleUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      deleteData,
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    const error = result.unwrapErrorOrThrow();
    expect(error).toBeInstanceOf(ModuleNotFoundError);
  });

  test("Should fail when user doesn't have EDIT_COURSE permission", async () => {
    // Arrange
    const deleteData = {
      moduleId: existingModuleId,
    };

    // Act
    const result = await DeleteModuleUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [], // No permissions
        },
      },
      deleteData,
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    const error = result.unwrapErrorOrThrow();
    expect(error).toBeInstanceOf(UnauthorizedError);

    // Verify module was not deleted
    const unchangedModule = await services.state
      .from("modules")
      .where({ id: existingModuleId })
      .selectOneOrFail()
      .runOrThrow();

    expect(unchangedModule.deletedAt).toBeNull();
  });

  test("Should fail with invalid moduleId", async () => {
    // Arrange
    const deleteData = {
      moduleId: "invalid-uuid",
    };

    // Act
    const result = await DeleteModuleUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      deleteData,
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
  });
});
