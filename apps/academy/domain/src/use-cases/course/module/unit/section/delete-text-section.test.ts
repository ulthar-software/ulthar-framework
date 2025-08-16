import type { UUID } from "@fabric/core";
import { beforeEach, describe, expect, test } from "@fabric/testing";
import { createCourseMock } from "../../../../../models/mocks/create-course-mock.js";
import { createModuleMock } from "../../../../../models/mocks/create-module-mock.js";
import { createTextSectionMock } from "../../../../../models/mocks/create-text-section-mock.js";
import { createUnitMock } from "../../../../../models/mocks/create-unit-mock.js";
import { createUserMock } from "../../../../../models/mocks/create-user-mock.js";
import type { User } from "../../../../../models/user.js";
import { Permission } from "../../../../../security/permission.js";
import { UserRole } from "../../../../../security/user-role.js";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../../../../../services/mocks/create-mock-services.js";
import { UnauthorizedError } from "../../../../../utils/use-case.js";
import { TextSectionNotFoundError } from "../../../errors.js";
import { DeleteTextSectionUseCase } from "./delete-text-section.js";

describe("Delete Text Section Use Case", () => {
  let services: MockedDependencies;
  let user: User;
  let existingTextSectionId: UUID;
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
      description: "A course for testing text section deletion",
    });

    // Add a module to the course
    existingModuleId = await createModuleMock(
      services,
      user.id,
      existingCourseId,
      {
        title: "Test Module",
        description: "A module for testing text section deletion",
      },
    );

    // Add a unit to the module
    existingUnitId = await createUnitMock(services, user.id, existingModuleId, {
      title: "Test Unit",
    });

    // Add a text section to the unit
    existingTextSectionId = await createTextSectionMock(
      services,
      user.id,
      existingUnitId,
      {
        content: {
          text: "Text section to delete",
        },
      },
    );
  });

  test("Admin should successfully delete a text section", async () => {
    // Arrange
    const deleteData = {
      sectionId: existingTextSectionId,
    };

    // Act
    await DeleteTextSectionUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      deleteData,
    ).runOrThrow();

    // Verify the text section was soft-deleted in the database
    const deletedTextSection = await services.state
      .from("textSections")
      .where({ id: existingTextSectionId })
      .selectOneOrFail()
      .runOrThrow();

    expect(deletedTextSection).toEqual(
      expect.objectContaining({
        content: {
          text: "Text section to delete",
        },
        unitId: existingUnitId,
      }),
    );

    // Check that deletedAt is a PosixDate with a timestamp
    expect(deletedTextSection.deletedAt).toBeDefined();
    expect(deletedTextSection.deletedAt?.timestamp).toEqual(expect.any(Number));
  });

  test("Deleting an already deleted text section should succeed (idempotent)", async () => {
    // Arrange - First delete the text section
    const deleteData = {
      sectionId: existingTextSectionId,
    };

    await DeleteTextSectionUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      deleteData,
    ).runOrThrow();

    // Act - Delete the same text section again
    await DeleteTextSectionUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      deleteData,
    ).runOrThrow();

    // Verify the text section is still deleted
    const deletedTextSection = await services.state
      .from("textSections")
      .where({ id: existingTextSectionId })
      .selectOneOrFail()
      .runOrThrow();

    expect(deletedTextSection.deletedAt).toBeDefined();
    expect(deletedTextSection.deletedAt?.timestamp).toEqual(expect.any(Number));
  });

  test("Should fail when text section doesn't exist", async () => {
    // Arrange
    const nonExistentSectionId = "00000000-0000-0000-0000-000000000000";
    const deleteData = {
      sectionId: nonExistentSectionId,
    };

    // Act
    const result = await DeleteTextSectionUseCase.call(
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
    expect(error).toBeInstanceOf(TextSectionNotFoundError);
  });

  test("Should fail when user doesn't have EDIT_COURSE permission", async () => {
    // Arrange
    const deleteData = {
      sectionId: existingTextSectionId,
    };

    // Act
    const result = await DeleteTextSectionUseCase.call(
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

    // Verify text section was not deleted
    const unchangedTextSection = await services.state
      .from("textSections")
      .where({ id: existingTextSectionId })
      .selectOneOrFail()
      .runOrThrow();

    expect(unchangedTextSection.deletedAt).toBeNull();
  });

  test("Should fail with invalid sectionId", async () => {
    // Arrange
    const deleteData = {
      sectionId: "invalid-uuid",
    };

    // Act
    const result = await DeleteTextSectionUseCase.call(
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
