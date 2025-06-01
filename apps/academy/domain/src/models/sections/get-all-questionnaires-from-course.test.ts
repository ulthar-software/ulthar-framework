import type { UUID } from "@fabric/core";
import { beforeEach, describe, expect, test } from "@fabric/testing";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../../services/mocks/create-mock-services.js";
import { createCourseMock } from "../mocks/create-course-mock.js";
import { createModuleMock } from "../mocks/create-module-mock.js";
import { createQuestionnaireSectionMock } from "../mocks/create-questionnaire-section-mock.js";
import { createUnitMock } from "../mocks/create-unit-mock.js";
import { createUserMock } from "../mocks/create-user-mock.js";
import type { User } from "../user.js";
import {
  getQuestionnairesCountFromCourse,
  getQuestionnairesFromCourse,
} from "./get-all-questionnaires-from-course.js";

describe("Get All Questionnaires Count From Course", () => {
  let services: MockedDependencies;
  let user: User;
  let existingCourseId: UUID;
  let existingModuleId: UUID;
  let existingUnitId: UUID;

  beforeEach(async () => {
    services = await createServiceMocks();

    // Create a test user
    user = await createUserMock(services);

    // Create a test course
    existingCourseId = await createCourseMock(services, user.id, {
      title: "Test Course",
      description: "A course for testing questionnaire counting",
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

    // Create a unit for the module
    existingUnitId = await createUnitMock(services, user.id, existingModuleId, {
      title: "Unit 1-1",
    });
  });

  test("Should return correct count of questionnaires in a course", async () => {
    // Arrange - Add multiple questionnaire sections
    await createQuestionnaireSectionMock(services, user.id, existingUnitId);
    await createQuestionnaireSectionMock(services, user.id, existingUnitId);

    // Act
    const result = await getQuestionnairesCountFromCourse(
      services.state,
      existingCourseId,
    ).runOrThrow();

    // Assert
    expect(result).toBe(2);
  });

  test("Should return correct questionnaires in a course", async () => {
    // Arrange - Add multiple questionnaire sections
    await createQuestionnaireSectionMock(services, user.id, existingUnitId);
    await createQuestionnaireSectionMock(services, user.id, existingUnitId);

    // Act
    const result = await getQuestionnairesFromCourse(
      services.state,
      existingCourseId,
    ).runOrThrow();

    // Assert
    expect(result).toHaveLength(2);
  });
});
