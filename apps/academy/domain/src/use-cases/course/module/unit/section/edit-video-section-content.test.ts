import { type UUID } from "@fabric/core";
import { beforeEach, describe, expect, test } from "@fabric/testing";
import { createCourseMock } from "../../../../../models/mocks/create-course-mock.js";
import { createModuleMock } from "../../../../../models/mocks/create-module-mock.js";
import { createUnitMock } from "../../../../../models/mocks/create-unit-mock.js";
import { createUserMock } from "../../../../../models/mocks/create-user-mock.js";
import { createVideoSectionMock } from "../../../../../models/mocks/create-video-section-mock.js";
import type { User } from "../../../../../models/user.js";
import { Permission } from "../../../../../security/permission.js";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../../../../../services/mocks/create-mock-services.js";
import { UnauthorizedError } from "../../../../../utils/use-case.js";
import { UnitNotFoundError } from "../../../errors.js";
import { EditVideoSectionContentUseCase } from "./edit-video-section-content.js";

describe("Edit Video Section Content Use Case", () => {
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

    // Add a video section to the unit
    existingSectionId = await createVideoSectionMock(
      services,
      user.id,
      unitId,
      {
        title: "Introduction Video",
        content: {
          videoUrl: "https://example.com/videos/intro.mp4",
        },
      },
    );
  });

  test("Admin should successfully edit a video section content", async () => {
    // Arrange
    const updatedContent = {
      sectionId: existingSectionId,
      videoUrl: "https://example.com/videos/updated.mp4",
    };

    // Act
    const result = await EditVideoSectionContentUseCase.call(
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
      .from("videoSections")
      .where({ id: existingSectionId })
      .selectOneOrFail()
      .runOrThrow();

    expect(sectionInDb.content).toEqual(
      expect.objectContaining({
        videoUrl: updatedContent.videoUrl,
      }),
    );
  });

  test("Should fail when editing a non-existent section", async () => {
    // Arrange
    const invalidSectionId = "00000000-0000-0000-0000-000000000000";
    const updatedContent = {
      sectionId: invalidSectionId,
      videoUrl: "https://example.com/videos/invalid.mp4",
    };

    // Act
    const result = await EditVideoSectionContentUseCase.call(
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
      videoUrl: "https://example.com/videos/unauthorized.mp4",
    };

    // Act
    const result = await EditVideoSectionContentUseCase.call(
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
