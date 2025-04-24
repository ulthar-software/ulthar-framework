/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { SchemaParsingError, type UUID } from "@fabric/core";
import { beforeEach, describe, expect, test } from "@fabric/testing";
import { createCourseMock } from "../../../../../models/mocks/create-course-mock.js";
import { createModuleMock } from "../../../../../models/mocks/create-module-mock.js";
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
import { AddVideoSectionToUnitUseCase } from "./add-video-section-to-unit.js";

describe("Add Video Section To Unit Use Case", () => {
  let services: MockedDependencies;
  let user: User;
  let existingUnitId: UUID;

  beforeEach(async () => {
    services = await createServiceMocks();

    // Create users with different roles
    user = await createUserMock(services);

    // Create a test course
    const courseId = await createCourseMock(services, user.id);

    // Add a module to the course
    const moduleId = await createModuleMock(services, user.id, courseId);

    // Add a unit to the module
    existingUnitId = await createUnitMock(services, user.id, moduleId);
  });

  test("Admin should successfully add a video section to a unit", async () => {
    // Arrange
    const sectionData = {
      unitId: existingUnitId,
      title: "Introduction Video",
      videoUrl: "https://example.com/videos/intro.mp4",
    };

    // Act
    const result = await AddVideoSectionToUnitUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      sectionData,
    ).runOrThrow();

    // Assert
    expect(result).toEqual({
      sectionId: expect.any(String),
    });

    // Verify the section was added to the database
    const sectionInDb = await services.state
      .from("videoSections")
      .where({ id: result.sectionId })
      .selectOneOrFail()
      .runOrThrow();

    expect(sectionInDb).toEqual(
      expect.objectContaining({
        title: sectionData.title,
        unitId: existingUnitId,
        order: 100, // First section should have order 100
        createdBy: user.id,
        content: expect.objectContaining({
          videoUrl: sectionData.videoUrl,
        }),
      }),
    );
  });

  test("Section order should increment correctly when multiple sections are added", async () => {
    // Arrange - Add first section
    const firstSectionData = {
      unitId: existingUnitId,
      title: "First Video Section",
      videoUrl: "https://example.com/videos/first.mp4",
    };

    await AddVideoSectionToUnitUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      firstSectionData,
    ).runOrThrow();

    // Arrange - Add second section
    const secondSectionData = {
      unitId: existingUnitId,
      title: "Second Video Section",
      videoUrl: "https://example.com/videos/second.mp4",
    };

    await AddVideoSectionToUnitUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      secondSectionData,
    ).runOrThrow();

    // Assert - Second section should have order = 200
    const sectionInDb = await services.state
      .from("videoSections")
      .where({ unitId: existingUnitId })
      .select()
      .runOrThrow();

    expect(sectionInDb.map((section) => section.order)).toEqual([100, 200]);
  });

  test("Should fail when adding a section to a non-existent unit", async () => {
    // Arrange
    const invalidUnitId = "00000000-0000-0000-0000-000000000000";
    const sectionData = {
      unitId: invalidUnitId,
      title: "Invalid Unit Video",
      videoUrl: "https://example.com/videos/invalid.mp4",
    };

    // Act
    const result = await AddVideoSectionToUnitUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      sectionData,
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(UnitNotFoundError);
  });

  test("Should fail when user lacks EDIT_COURSE permission", async () => {
    // Arrange
    const sectionData = {
      unitId: existingUnitId,
      title: "Unauthorized Video",
      videoUrl: "https://example.com/videos/unauthorized.mp4",
    };

    // Act
    const result = await AddVideoSectionToUnitUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [], // No permissions
        },
      },
      sectionData,
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(UnauthorizedError);
  });

  test("Should fail when input validation fails", async () => {
    // Arrange
    const invalidInput = {
      unitId: existingUnitId,
      title: "AB", // Too short (min 3 chars)
      videoUrl: "not-a-valid-url", // Invalid URL
    };

    // Act
    const result = await AddVideoSectionToUnitUseCase.call(
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
});
