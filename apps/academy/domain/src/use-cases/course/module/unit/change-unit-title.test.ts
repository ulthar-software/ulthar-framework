import { SchemaParsingError, type UUID } from "@fabric/core";
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
import { ChangeUnitTitleUseCase } from "./change-unit-title.js";

describe("Change Unit Title Use Case", () => {
  let services: MockedDependencies;
  let user: User;
  let existingCourseId: UUID;
  let existingModuleId: UUID;
  let existingUnitId: UUID;

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
      description: "Test course description",
    });

    // Create a test module
    existingModuleId = await createModuleMock(
      services,
      user.id,
      existingCourseId,
      {
        title: "Test Module",
      },
    );

    // Create a test unit
    existingUnitId = await createUnitMock(services, user.id, existingModuleId, {
      title: "Original Unit Title",
    });
  });

  test("Admin should successfully change unit title", async () => {
    // Arrange
    const updateData = {
      unitId: existingUnitId,
      title: "Updated Unit Title",
    };

    // Act
    await ChangeUnitTitleUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      updateData,
    ).runOrThrow();

    // Verify the unit was updated in the database
    const updatedUnit = await services.state
      .from("units")
      .where({ id: existingUnitId })
      .selectOneOrFail()
      .runOrThrow();

    expect(updatedUnit).toEqual(
      expect.objectContaining({
        title: updateData.title,
      }),
    );
  });

  test("Should fail when unit doesn't exist", async () => {
    // Arrange
    const nonExistentUnitId = "00000000-0000-0000-0000-000000000000";
    const updateData = {
      unitId: nonExistentUnitId,
      title: "Updated Title",
    };

    // Act
    const result = await ChangeUnitTitleUseCase.call(
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
    expect(error).toBeInstanceOf(UnitNotFoundError);
  });

  test("Should fail when title is too short", async () => {
    // Arrange
    const updateData = {
      unitId: existingUnitId,
      title: "AB", // Too short (minLength: 3)
    };

    // Act
    const result = await ChangeUnitTitleUseCase.call(
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
      unitId: existingUnitId,
      title: "Unauthorized Update",
    };

    // Act
    const result = await ChangeUnitTitleUseCase.call(
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
