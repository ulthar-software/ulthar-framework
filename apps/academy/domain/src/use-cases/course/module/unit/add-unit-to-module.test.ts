import { SchemaParsingError, type UUID } from "@fabric/core";
import { beforeEach, describe, expect, test } from "@fabric/testing";
import { createUserMock } from "../../../../models/mocks/create-user-mock.js";
import type { User } from "../../../../models/user.js";
import { Permission } from "../../../../security/permission.js";
import { UserRole } from "../../../../security/user-role.js";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../../../../services/mocks/create-mock-services.js";
import { UnauthorizedError } from "../../../../utils/use-case.js";
import { CreateCourseUseCase } from "../../create-course.js";
import { AddModuleToCourseUseCase } from "../add-module-to-course.js";
import {
  AddUnitToModuleUseCase,
  ModuleNotFoundError,
} from "./add-unit-to-module.js";

describe("Add Unit To Module Use Case", () => {
  let services: MockedDependencies;
  let adminUser: User;
  let teacherUser: User;
  let studentUser: User;
  let existingModuleId: UUID;

  beforeEach(async () => {
    services = await createServiceMocks();
    adminUser = await createUserMock(services, {
      role: UserRole.ADMIN,
    });
    teacherUser = await createUserMock(services, {
      role: UserRole.TEACHER,
    });
    studentUser = await createUserMock(services, {
      role: UserRole.STUDENT,
    });

    // Create a course and module for testing
    const courseResult = await CreateCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: adminUser.id,
          permissions: [Permission.CREATE_COURSE],
        },
      },
      {
        title: "Test Course",
        description: "Test Description",
      },
    ).runOrThrow();

    const courseId = courseResult.courseId;

    const moduleResult = await AddModuleToCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: adminUser.id,
          permissions: [Permission.ADD_MODULE_TO_COURSE],
        },
      },
      {
        courseId,
        title: "Test Module",
        description: "Test Module Description",
      },
    ).runOrThrow();

    existingModuleId = moduleResult.moduleId;
  });

  test("Given a valid module ID and unit name, it should add a unit to the module", async () => {
    // Arrange
    const input = {
      moduleId: existingModuleId,
      name: "Test Unit",
    };

    // Act
    const result = await AddUnitToModuleUseCase.call(
      {
        ...services,
        currentUser: {
          id: teacherUser.id,
          permissions: [Permission.ADD_UNIT_TO_MODULE],
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
        name: "Test Unit",
        moduleId: existingModuleId,
        order: 100, // First unit in the module
        createdBy: teacherUser.id,
      }),
    );
  });

  test("Given an invalid module ID, it should return ModuleNotFoundError", async () => {
    // Arrange
    const nonExistentModuleId = services.crypto.randomUUID();
    const input = {
      moduleId: nonExistentModuleId,
      name: "Test Unit",
    };

    // Act
    const result = await AddUnitToModuleUseCase.call(
      {
        ...services,
        currentUser: {
          id: teacherUser.id,
          permissions: [Permission.ADD_UNIT_TO_MODULE],
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
      name: "Test Unit",
    };

    // Act
    const result = await AddUnitToModuleUseCase.call(
      {
        ...services,
        currentUser: {
          id: studentUser.id,
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
      name: "", // Too short
    };

    // Act
    const result = await AddUnitToModuleUseCase.call(
      {
        ...services,
        currentUser: {
          id: teacherUser.id,
          permissions: [Permission.ADD_UNIT_TO_MODULE],
        },
      },
      invalidInput,
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(SchemaParsingError);
  });
});
