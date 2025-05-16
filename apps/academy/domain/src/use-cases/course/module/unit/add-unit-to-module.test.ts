import { SchemaParsingError, type UUID } from "@fabric/core";
import { beforeEach, describe, expect, test } from "@fabric/testing";
import { createCourseMock } from "../../../../models/mocks/create-course-mock.js";
import { createModuleMock } from "../../../../models/mocks/create-module-mock.js";
import { createTagMock } from "../../../../models/mocks/create-tag-mock.js";
import { createUserMock } from "../../../../models/mocks/create-user-mock.js";
import type { User } from "../../../../models/user.js";
import { Permission } from "../../../../security/permission.js";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../../../../services/mocks/create-mock-services.js";
import { UnauthorizedError } from "../../../../utils/use-case.js";
import { TagNotFoundError } from "../../../tag/errors.js";
import { ModuleNotFoundError } from "../../errors.js";
import { AddUnitToModuleUseCase } from "./add-unit-to-module.js";

describe("Add Unit To Module Use Case", () => {
  let services: MockedDependencies;
  let user: User;
  let existingModuleId: UUID;

  beforeEach(async () => {
    services = await createServiceMocks();

    // Create users with different roles
    user = await createUserMock(services);

    // Create a test course
    const courseId = await createCourseMock(services, user.id);

    // Add a module to the course
    existingModuleId = await createModuleMock(services, user.id, courseId);
  });

  test("Given a valid module ID and unit title, it should add a unit to the module", async () => {
    // Arrange
    const input = {
      moduleId: existingModuleId,
      title: "Test Unit",
    };

    // Act
    const result = await AddUnitToModuleUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      input,
    ).run();

    // Assert
    expect(result.isOk()).toBe(true);
    const { unitId } = result.unwrapOrThrow();
    expect(unitId).toBeDefined();

    // Verify the unit was created correctly in the state store
    const unit = await services.state
      .from("units")
      .where({ id: unitId })
      .selectOneOrFail()
      .run();

    expect(unit.unwrapOrThrow()).toEqual(
      expect.objectContaining({
        id: unitId,
        title: "Test Unit",
        moduleId: existingModuleId,
        order: 100, // First unit in the module
        createdBy: user.id,
      }),
    );
  });

  test("Given an invalid module ID, it should return ModuleNotFoundError", async () => {
    // Arrange
    const nonExistentModuleId = services.crypto.randomUUID();
    const input = {
      moduleId: nonExistentModuleId,
      title: "Test Unit",
    };

    // Act
    const result = await AddUnitToModuleUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      input,
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    const error = result.unwrapErrorOrThrow();
    if (!(error instanceof ModuleNotFoundError)) {
      throw new Error("Expected ModuleNotFoundError");
    }
    expect(error.moduleId).toEqual(nonExistentModuleId);
  });

  test("Given a user without permission, it should return UnauthorizedError", async () => {
    // Arrange
    const input = {
      moduleId: existingModuleId,
      title: "Test Unit",
    };

    // Act
    const result = await AddUnitToModuleUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [],
        },
      },
      input,
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(UnauthorizedError);
  });

  test("Given invalid input data, it should return SchemaParsingError", async () => {
    // Arrange
    const invalidInput = {
      moduleId: existingModuleId,
      title: "", // Too short
    };

    // Act
    const result = await AddUnitToModuleUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      invalidInput,
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(SchemaParsingError);
  });

  test("Given a valid module ID, unit title, and a tag ID, it should add a unit to the module with the tag", async () => {
    // Arrange
    // Create a tag first
    const tagId = await createTagMock(services, user.id, {
      name: "JavaScript",
    });

    const input = {
      moduleId: existingModuleId,
      title: "JavaScript Basics",
      tagIds: [tagId],
    };

    // Act
    const result = await AddUnitToModuleUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      input,
    ).run();

    // Assert
    expect(result.isOk()).toBe(true);
    const { unitId } = result.unwrapOrThrow();
    expect(unitId).toBeDefined();

    // Verify the unit was created correctly in the state store
    const unit = await services.state
      .from("units")
      .where({ id: unitId })
      .selectOneOrFail()
      .run();

    expect(unit.unwrapOrThrow()).toEqual(
      expect.objectContaining({
        id: unitId,
        title: "JavaScript Basics",
        moduleId: existingModuleId,
        createdBy: user.id,
      }),
    );

    // Verify that the unit-tag association was created
    const unitTag = await services.state
      .from("unitTags")
      .where({ unitId, tagId })
      .selectOneOrFail()
      .run();

    expect(unitTag.isOk()).toBe(true);
    expect(unitTag.unwrapOrThrow()).toEqual(
      expect.objectContaining({
        unitId,
        tagId,
        createdBy: user.id,
      }),
    );
  });

  test("Given a valid module ID, unit title, and multiple tag IDs, it should add a unit to the module with all tags", async () => {
    // Arrange
    // Create multiple tags
    const javascriptTagId = await createTagMock(services, user.id, {
      name: "JavaScript",
    });
    const typescriptTagId = await createTagMock(services, user.id, {
      name: "TypeScript",
    });
    const frontendTagId = await createTagMock(services, user.id, {
      name: "Frontend",
    });

    const input = {
      moduleId: existingModuleId,
      title: "Modern Web Development",
      tagIds: [javascriptTagId, typescriptTagId, frontendTagId],
    };

    // Act
    const result = await AddUnitToModuleUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      input,
    ).run();

    // Assert
    const { unitId } = result.unwrapOrThrow();
    expect(unitId).toBeDefined();

    // Verify the unit was created correctly in the state store
    const unit = await services.state
      .from("units")
      .where({ id: unitId })
      .selectOneOrFail()
      .run();

    expect(unit.unwrapOrThrow()).toEqual(
      expect.objectContaining({
        id: unitId,
        title: "Modern Web Development",
        moduleId: existingModuleId,
        createdBy: user.id,
      }),
    );

    // Verify that all unit-tag associations were created
    const unitTags = await services.state
      .from("unitTags")
      .where({ unitId })
      .select()
      .run();

    const unitTagsResult = unitTags.unwrapOrThrow();
    expect(unitTagsResult).toHaveLength(3);

    // Check that each tag was properly associated
    const tagIds = unitTagsResult.map((ut) => ut.tagId);
    expect(tagIds).toContain(javascriptTagId);
    expect(tagIds).toContain(typescriptTagId);
    expect(tagIds).toContain(frontendTagId);
  });

  test("Given a valid module ID, unit title, and a non-existent tag ID, it should return an error", async () => {
    // Arrange
    const nonExistentTagId = services.crypto.randomUUID();
    const input = {
      moduleId: existingModuleId,
      title: "Unit with Invalid Tag",
      tagIds: [nonExistentTagId],
    };

    // Act
    const result = await AddUnitToModuleUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      input,
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    const error = result.unwrapErrorOrThrow();
    expect(error).toBeInstanceOf(TagNotFoundError);
  });
});
