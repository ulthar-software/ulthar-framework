import type { UUID } from "@fabric/core";
import { beforeEach, describe, expect, test } from "@fabric/testing";
import { createCourseMock } from "../../../../models/mocks/create-course-mock.js";
import { createModuleMock } from "../../../../models/mocks/create-module-mock.js";
import { createUnitMock } from "../../../../models/mocks/create-unit-mock.js";
import { createUserMock } from "../../../../models/mocks/create-user-mock.js";
import type { User } from "../../../../models/user.js";
import { Permission } from "../../../../security/permission.js";
import { UserRole } from "../../../../security/user-role.js";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../../../../services/mocks/create-mock-services.js";
import { UnauthorizedError } from "../../../../utils/use-case.js";
import { UnitNotFoundError } from "../../errors.js";
import { DeleteUnitUseCase } from "./delete-unit.js";

describe("Delete Unit Use Case", () => {
  let services: MockedDependencies;
  let user: User;
  let existingUnitId: UUID;
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
      description: "A course for testing unit deletion",
    });

    // Add a module to the course
    existingModuleId = await createModuleMock(
      services,
      user.id,
      existingCourseId,
      {
        title: "Test Module",
        description: "A module for testing unit deletion",
      },
    );

    // Add a unit to the module
    existingUnitId = await createUnitMock(services, user.id, existingModuleId, {
      title: "Unit to Delete",
    });
  });

  test("Admin should successfully delete a unit", async () => {
    // Arrange
    const deleteData = {
      unitId: existingUnitId,
    };

    // Act
    await DeleteUnitUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      deleteData,
    ).runOrThrow();

    // Verify the unit was soft-deleted in the database
    const deletedUnit = await services.state
      .from("units")
      .where({ id: existingUnitId })
      .selectOneOrFail()
      .runOrThrow();

    expect(deletedUnit).toEqual(
      expect.objectContaining({
        title: "Unit to Delete",
        moduleId: existingModuleId,
      }),
    );

    // Check that deletedAt is a PosixDate with a timestamp
    expect(deletedUnit.deletedAt).toBeDefined();
    expect(deletedUnit.deletedAt?.timestamp).toEqual(expect.any(Number));
  });

  test("Deleting an already deleted unit should succeed (idempotent)", async () => {
    // Arrange - First delete the unit
    const deleteData = {
      unitId: existingUnitId,
    };

    await DeleteUnitUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      deleteData,
    ).runOrThrow();

    // Act - Delete the same unit again
    await DeleteUnitUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      deleteData,
    ).runOrThrow();

    // Verify the unit is still deleted
    const deletedUnit = await services.state
      .from("units")
      .where({ id: existingUnitId })
      .selectOneOrFail()
      .runOrThrow();

    expect(deletedUnit.deletedAt).toBeDefined();
    expect(deletedUnit.deletedAt?.timestamp).toEqual(expect.any(Number));
  });

  test("Should fail when unit doesn't exist", async () => {
    // Arrange
    const nonExistentUnitId = "00000000-0000-0000-0000-000000000000";
    const deleteData = {
      unitId: nonExistentUnitId,
    };

    // Act
    const result = await DeleteUnitUseCase.call(
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
    expect(error).toBeInstanceOf(UnitNotFoundError);
  });

  test("Should fail when user doesn't have EDIT_COURSE permission", async () => {
    // Arrange
    const deleteData = {
      unitId: existingUnitId,
    };

    // Act
    const result = await DeleteUnitUseCase.call(
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

    // Verify unit was not deleted
    const unchangedUnit = await services.state
      .from("units")
      .where({ id: existingUnitId })
      .selectOneOrFail()
      .runOrThrow();

    expect(unchangedUnit.deletedAt).toBeNull();
  });

  test("Should fail with invalid unitId", async () => {
    // Arrange
    const deleteData = {
      unitId: "invalid-uuid",
    };

    // Act
    const result = await DeleteUnitUseCase.call(
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
