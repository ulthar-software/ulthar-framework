import type { UUID } from "@fabric/core";
import { beforeEach, describe, expect, test } from "@fabric/testing";
import { createCourseMock } from "../../models/mocks/create-course-mock.js";
import { createEnrollmentMock } from "../../models/mocks/create-enrollment-mock.js";
import { createModuleMock } from "../../models/mocks/create-module-mock.js";
import { createUnitMock } from "../../models/mocks/create-unit-mock.js";
import { createUserMock } from "../../models/mocks/create-user-mock.js";
import type { User } from "../../models/user.js";
import { Permission } from "../../security/permission.js";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../../services/mocks/create-mock-services.js";
import { CourseNotFoundError, NotEnrolledInCourseError } from "./errors.js";
import { GetCourseDetailsUseCase } from "./get-course-details.js";

describe("Get Course Details Use Case", () => {
  let services: MockedDependencies;
  let user: User;
  let existingCourseId: UUID;
  let moduleIds: UUID[] = [];
  let unitIds: UUID[] = [];

  beforeEach(async () => {
    services = await createServiceMocks();

    // Create a test user
    user = await createUserMock(services);

    // Create a test course
    existingCourseId = await createCourseMock(services, user.id, {
      title: "Test Course",
      description: "A course for testing course details",
    });

    // Create modules for the course
    moduleIds = [
      await createModuleMock(services, user.id, existingCourseId, {
        title: "Module 1",
        description: "First module",
      }),
      await createModuleMock(services, user.id, existingCourseId, {
        title: "Module 2",
        description: "Second module",
      }),
    ];

    // Create units for each module
    unitIds = [
      await createUnitMock(services, user.id, moduleIds[0], {
        title: "Unit 1-1",
      }),
      await createUnitMock(services, user.id, moduleIds[0], {
        title: "Unit 1-2",
      }),
      await createUnitMock(services, user.id, moduleIds[1], {
        title: "Unit 2-1",
      }),
    ];
  });

  test("Admin with VIEW_COURSE permission should see course details with modules and units", async () => {
    // Arrange
    const queryData = {
      courseId: existingCourseId,
    };

    // Act
    const result = await GetCourseDetailsUseCase.call(
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
    expect(result.course).toEqual(
      expect.objectContaining({
        id: existingCourseId,
        title: "Test Course",
        description: "A course for testing course details",
      }),
    );

    // Check modules
    expect(result.modules).toHaveLength(2);
    expect(result.modules[0].id).toBe(moduleIds[0]);
    expect(result.modules[0].title).toBe("Module 1");
    expect(result.modules[1].id).toBe(moduleIds[1]);
    expect(result.modules[1].title).toBe("Module 2");

    // Check units in first module
    expect(result.modules[0].units).toHaveLength(2);
    expect(result.modules[0].units[0].id).toBe(unitIds[0]);
    expect(result.modules[0].units[0].title).toBe("Unit 1-1");
    expect(result.modules[0].units[1].id).toBe(unitIds[1]);
    expect(result.modules[0].units[1].title).toBe("Unit 1-2");

    // Check units in second module
    expect(result.modules[1].units).toHaveLength(1);
    expect(result.modules[1].units[0].id).toBe(unitIds[2]);
    expect(result.modules[1].units[0].title).toBe("Unit 2-1");
  });

  test("Enrolled student should see course details with modules and units", async () => {
    // Arrange
    // Enroll the student in the course
    await createEnrollmentMock(services, user.id, existingCourseId);

    const queryData = {
      courseId: existingCourseId,
    };

    // Act
    const result = await GetCourseDetailsUseCase.call(
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
    expect(result.course).toEqual(
      expect.objectContaining({
        id: existingCourseId,
        title: "Test Course",
        description: "A course for testing course details",
      }),
    );

    // Check modules
    expect(result.modules).toHaveLength(2);

    // Check that both modules have the correct units
    expect(result.modules[0].units).toHaveLength(2);
    expect(result.modules[1].units).toHaveLength(1);
  });

  test("Should return empty modules array for course with no modules", async () => {
    // Arrange - Create a new course with no modules
    const emptyCourseId = await createCourseMock(services, user.id, {
      title: "Empty Course",
      description: "A course with no modules",
    });

    // Enroll the student in the course
    await createEnrollmentMock(services, user.id, emptyCourseId);

    const queryData = {
      courseId: emptyCourseId,
    };

    // Act
    const result = await GetCourseDetailsUseCase.call(
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
    expect(result.course).toEqual(
      expect.objectContaining({
        id: emptyCourseId,
        title: "Empty Course",
      }),
    );
    expect(result.modules).toHaveLength(0);
  });

  test("Non-enrolled student should not be able to see course details", async () => {
    // Arrange
    const queryData = {
      courseId: existingCourseId,
    };

    // Act
    const result = await GetCourseDetailsUseCase.call(
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
    };

    // Act
    const result = await GetCourseDetailsUseCase.call(
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
});
