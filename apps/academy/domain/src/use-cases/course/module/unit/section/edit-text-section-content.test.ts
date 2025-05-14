import { type UUID } from "@fabric/core";
import { beforeEach, describe, expect, test } from "@fabric/testing";
import { createCourseMock } from "../../../../../models/mocks/create-course-mock.js";
import { createModuleMock } from "../../../../../models/mocks/create-module-mock.js";
import { createTextSectionMock } from "../../../../../models/mocks/create-text-section-mock.js";
import { createUnitMock } from "../../../../../models/mocks/create-unit-mock.js";
import { createUserMock } from "../../../../../models/mocks/create-user-mock.js";
import type { User } from "../../../../../models/user.js";
import { Permission } from "../../../../../security/permission.js";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../../../../../services/mocks/create-mock-services.js";
import { UnauthorizedError } from "../../../../../utils/use-case.js";
import { UnitNotFoundError } from "../../../errors.js";
import { EditTextSectionContentUseCase } from "./edit-text-section-content.js";

describe("Edit Text Section Content Use Case", () => {
  let services: MockedDependencies;
  let user: User;
  let existingSectionId: UUID;

  beforeEach(async () => {
    services = await createServiceMocks();

    // Create users with different roles
    user = await createUserMock(services);

    // Create a test course
    const courseId = await createCourseMock(services, user.id);

    // Add a module to the course
    const moduleId = await createModuleMock(services, user.id, courseId);

    // Add a unit to the module
    const unitId = await createUnitMock(services, user.id, moduleId);

    // Add a text section to the unit
    existingSectionId = await createTextSectionMock(services, user.id, unitId, {
      content: {
        text: "Initial text content",
      },
    });
  });

  test("Admin should successfully edit a text section content", async () => {
    // Arrange
    const updatedContent = {
      sectionId: existingSectionId,
      text: "Updated text content",
    };

    // Act
    const result = await EditTextSectionContentUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      updatedContent,
    ).runOrThrow();

    // Assert
    expect(result).toEqual({
      sectionId: existingSectionId,
    });

    // Verify the section content was updated in the database
    const sectionInDb = await services.state
      .from("textSections")
      .where({ id: existingSectionId })
      .selectOneOrFail()
      .runOrThrow();

    expect(sectionInDb.content).toEqual(
      expect.objectContaining({
        text: updatedContent.text,
      }),
    );
  });

  test("Should fail when editing a non-existent section", async () => {
    // Arrange
    const invalidSectionId = "00000000-0000-0000-0000-000000000000";
    const updatedContent = {
      sectionId: invalidSectionId,
      text: "Invalid text content",
    };

    // Act
    const result = await EditTextSectionContentUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      updatedContent,
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(UnitNotFoundError);
  });

  test("Should fail when user lacks EDIT_COURSE permission", async () => {
    // Arrange
    const updatedContent = {
      sectionId: existingSectionId,
      text: "Unauthorized text content",
    };

    // Act
    const result = await EditTextSectionContentUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [], // No permissions
        },
      },
      updatedContent,
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(UnauthorizedError);
  });
});
