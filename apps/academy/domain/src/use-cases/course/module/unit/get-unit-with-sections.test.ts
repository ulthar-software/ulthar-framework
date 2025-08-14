import type { UUID } from "@fabric/core";
import { beforeEach, describe, expect, test } from "@fabric/testing";
import { createCourseMock } from "../../../../models/mocks/create-course-mock.js";
import { createEnrollmentMock } from "../../../../models/mocks/create-enrollment-mock.js";
import {
  createModuleMock,
  deleteModuleMock,
} from "../../../../models/mocks/create-module-mock.js";
import { createTextSectionMock } from "../../../../models/mocks/create-text-section-mock.js";
import { createUnitMock } from "../../../../models/mocks/create-unit-mock.js";
import { createUserMock } from "../../../../models/mocks/create-user-mock.js";
import type { User } from "../../../../models/user.js";
import { Permission } from "../../../../security/permission.js";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../../../../services/mocks/create-mock-services.js";
import {
  CourseNotFoundError,
  NotEnrolledInCourseError,
  UnitNotFoundError,
} from "../../errors.js";
import { GetUnitWithSectionsUseCase } from "./get-unit-with-sections.js";

describe("Get Unit With Sections Use Case", () => {
  let services: MockedDependencies;
  let user: User;
  let existingCourseId: UUID;
  let existingModuleId: UUID;
  let existingUnitId: UUID;
  let sectionsIds: UUID[] = [];

  beforeEach(async () => {
    services = await createServiceMocks();

    // Create a test user
    user = await createUserMock(services);

    // Create a test course
    existingCourseId = await createCourseMock(services, user.id, {
      title: "Test Course",
      description: "A course for testing unit with sections",
    });

    // Create a module for the course
    existingModuleId = await createModuleMock(
      services,
      user.id,
      existingCourseId,
      {
        title: "Module 1",
        description: "First module",
      },
    );

    // Create a second module for testing first unit auto-selection
    const secondModuleId = await createModuleMock(
      services,
      user.id,
      existingCourseId,
      {
        title: "Module 2",
        description: "Second module",
      },
    );

    // Create a unit for the module
    existingUnitId = await createUnitMock(services, user.id, existingModuleId, {
      title: "Unit 1-1",
    });

    // Create a second unit for the first module
    await createUnitMock(services, user.id, existingModuleId, {
      title: "Unit 1-2",
    });

    // Create a unit for the second module
    await createUnitMock(services, user.id, secondModuleId, {
      title: "Unit 2-1",
    });

    // Create different types of sections for the unit
    sectionsIds = [];

    // Add sections
    sectionsIds.push(
      await createTextSectionMock(services, user.id, existingUnitId),
      await createTextSectionMock(services, user.id, existingUnitId),
      await createTextSectionMock(services, user.id, existingUnitId),
    );
  });

  test("Admin should successfully get a unit with all its sections in order", async () => {
    // Arrange
    const queryData = {
      courseId: existingCourseId,
      unitId: existingUnitId,
    };

    // Act
    const result = await GetUnitWithSectionsUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.VIEW_COURSE],
        },
      },
      queryData,
    ).runOrThrow();

    // Assert
    expect(result.unit).toEqual(
      expect.objectContaining({
        id: existingUnitId,
        title: "Unit 1-1",
        moduleId: existingModuleId,
      }),
    );

    // Check sections
    expect(result.sections).toHaveLength(3);

    // Verify sections are in the correct order
    expect(result.sections[0].order).toBe(100);
    expect(result.sections[1].order).toBe(200);
    expect(result.sections[2].order).toBe(300);
  });

  test("Enrolled student should successfully get a unit with all its sections", async () => {
    // Arrange - Enroll the student in the course
    await createEnrollmentMock(services, user.id, existingCourseId);

    const queryData = {
      courseId: existingCourseId,
      unitId: existingUnitId,
    };

    // Act
    const result = await GetUnitWithSectionsUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [], // No special permissions
        },
      },
      queryData,
    ).runOrThrow();

    // Assert
    expect(result.unit).toEqual(
      expect.objectContaining({
        id: existingUnitId,
      }),
    );

    // Check sections
    expect(result.sections).toHaveLength(3);

    // Verify sections are in the correct order (100, 200, 300)
    const orders = result.sections.map((section) => section.order);
    expect(orders).toEqual([100, 200, 300]);
  });

  test("Should auto-select first unit when unitId is not provided", async () => {
    // Arrange
    const queryData = {
      courseId: existingCourseId,
      // No unitId provided
    };

    // Act
    const result = await GetUnitWithSectionsUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.VIEW_COURSE],
        },
      },
      queryData,
    ).runOrThrow();

    // Assert
    expect(result.unit).toEqual(
      expect.objectContaining({
        title: "Unit 1-1", // Should be the first unit in the first module
      }),
    );

    // Should still contain the sections for the selected unit
    expect(result.sections).toHaveLength(3);
  });

  test("Should skip units from a deleted module when unitId is not provided", async () => {
    // Arrange
    const queryData = {
      courseId: existingCourseId,
      // No unitId provided
    };

    await deleteModuleMock(services, user.id, existingModuleId);

    // Act
    const result = await GetUnitWithSectionsUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.VIEW_COURSE],
        },
      },
      queryData,
    ).runOrThrow();

    // Assert
    expect(result.unit).toEqual(
      expect.objectContaining({
        title: "Unit 2-1", // Should be the first unit in the second module
      }),
    );
  });

  test("Non-enrolled student should not be able to see unit with sections", async () => {
    // Arrange
    const queryData = {
      courseId: existingCourseId,
      unitId: existingUnitId,
    };

    // Act
    const result = await GetUnitWithSectionsUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [], // No special permissions
        },
      },
      queryData,
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    const error = result.unwrapErrorOrThrow();
    expect(error).toBeInstanceOf(NotEnrolledInCourseError);
    expect((error as NotEnrolledInCourseError).userId).toBe(user.id);
    expect((error as NotEnrolledInCourseError).courseId).toBe(existingCourseId);
  });

  test("Should fail when course doesn't exist", async () => {
    // Arrange
    const nonExistentCourseId = "00000000-0000-0000-0000-000000000000";
    const queryData = {
      courseId: nonExistentCourseId,
      unitId: existingUnitId,
    };

    // Act
    const result = await GetUnitWithSectionsUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.VIEW_COURSE],
        },
      },
      queryData,
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    const error = result.unwrapErrorOrThrow();
    expect(error).toBeInstanceOf(CourseNotFoundError);
  });

  test("Should fail when unit doesn't exist", async () => {
    // Arrange
    const nonExistentUnitId = "00000000-0000-0000-0000-000000000000";
    const queryData = {
      courseId: existingCourseId,
      unitId: nonExistentUnitId,
    };

    // Act
    const result = await GetUnitWithSectionsUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.VIEW_COURSE],
        },
      },
      queryData,
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    const error = result.unwrapErrorOrThrow();
    expect(error).toBeInstanceOf(UnitNotFoundError);
    expect((error as UnitNotFoundError).unitId).toBe(nonExistentUnitId);
  });

  test("Should return empty sections array when unit has no sections", async () => {
    // Arrange - Create a new unit with no sections
    const newModuleId = await createModuleMock(
      services,
      user.id,
      existingCourseId,
    );
    const newUnitId = await createUnitMock(services, user.id, newModuleId);

    const queryData = {
      courseId: existingCourseId,
      unitId: newUnitId,
    };

    // Act
    const result = await GetUnitWithSectionsUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.VIEW_COURSE],
        },
      },
      queryData,
    ).runOrThrow();

    // Assert
    expect(result.unit.id).toBe(newUnitId);
    expect(result.sections).toHaveLength(0);
  });
});
