import type { UUID } from "@fabric/core";
import { beforeEach, describe, expect, test } from "@fabric/testing";
import { createCourseMock } from "../../../../../models/mocks/create-course-mock.js";
import { createModuleMock } from "../../../../../models/mocks/create-module-mock.js";
import { createUnitMock } from "../../../../../models/mocks/create-unit-mock.js";
import { createUserMock } from "../../../../../models/mocks/create-user-mock.js";
import { createVideoSectionMock } from "../../../../../models/mocks/create-video-section-mock.js";
import type { User } from "../../../../../models/user.js";
import { Permission } from "../../../../../security/permission.js";
import { UserRole } from "../../../../../security/user-role.js";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../../../../../services/mocks/create-mock-services.js";
import { UnauthorizedError } from "../../../../../utils/use-case.js";
import { VideoSectionNotFoundError } from "../../../errors.js";
import { DeleteVideoSectionUseCase } from "./delete-video-section.js";

describe("Delete Video Section Use Case", () => {
  let services: MockedDependencies;
  let user: User;
  let existingVideoSectionId: UUID;
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
      description: "A course for testing video section deletion",
    });

    // Add a module to the course
    existingModuleId = await createModuleMock(
      services,
      user.id,
      existingCourseId,
      {
        title: "Test Module",
        description: "A module for testing video section deletion",
      },
    );

    // Add a unit to the module
    existingUnitId = await createUnitMock(services, user.id, existingModuleId, {
      title: "Test Unit",
    });

    // Add a video section to the unit
    existingVideoSectionId = await createVideoSectionMock(
      services,
      user.id,
      existingUnitId,
      {
        title: "Video section to delete",
        content: {
          videoUrl: "https://example.com/test-video-to-delete.mp4",
        },
      },
    );
  });

  test("Admin should successfully delete a video section", async () => {
    // Arrange
    const deleteData = {
      sectionId: existingVideoSectionId,
    };

    // Act
    await DeleteVideoSectionUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      deleteData,
    ).runOrThrow();

    // Verify the video section was soft-deleted in the database
    const deletedVideoSection = await services.state
      .from("videoSections")
      .where({ id: existingVideoSectionId })
      .selectOneOrFail()
      .runOrThrow();

    expect(deletedVideoSection).toEqual(
      expect.objectContaining({
        title: "Video section to delete",
        unitId: existingUnitId,
      }),
    );

    // Check that deletedAt is a PosixDate with a timestamp
    expect(deletedVideoSection.deletedAt).toBeDefined();
    expect(deletedVideoSection.deletedAt?.timestamp).toEqual(
      expect.any(Number),
    );
  });

  test("Deleting an already deleted video section should succeed (idempotent)", async () => {
    // Arrange - First delete the video section
    const deleteData = {
      sectionId: existingVideoSectionId,
    };

    await DeleteVideoSectionUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      deleteData,
    ).runOrThrow();

    // Act - Delete the same video section again
    await DeleteVideoSectionUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      deleteData,
    ).runOrThrow();

    // Verify the video section is still deleted
    const deletedVideoSection = await services.state
      .from("videoSections")
      .where({ id: existingVideoSectionId })
      .selectOneOrFail()
      .runOrThrow();

    expect(deletedVideoSection.deletedAt).toBeDefined();
    expect(deletedVideoSection.deletedAt?.timestamp).toEqual(
      expect.any(Number),
    );
  });

  test("Should fail when video section doesn't exist", async () => {
    // Arrange
    const nonExistentSectionId = "00000000-0000-0000-0000-000000000000";
    const deleteData = {
      sectionId: nonExistentSectionId,
    };

    // Act
    const result = await DeleteVideoSectionUseCase.call(
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
    expect(error).toBeInstanceOf(VideoSectionNotFoundError);
  });

  test("Should fail when user doesn't have EDIT_COURSE permission", async () => {
    // Arrange
    const deleteData = {
      sectionId: existingVideoSectionId,
    };

    // Act
    const result = await DeleteVideoSectionUseCase.call(
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

    // Verify video section was not deleted
    const unchangedVideoSection = await services.state
      .from("videoSections")
      .where({ id: existingVideoSectionId })
      .selectOneOrFail()
      .runOrThrow();

    expect(unchangedVideoSection.deletedAt).toBeNull();
  });

  test("Should fail with invalid sectionId", async () => {
    // Arrange
    const deleteData = {
      sectionId: "invalid-uuid",
    };

    // Act
    const result = await DeleteVideoSectionUseCase.call(
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
