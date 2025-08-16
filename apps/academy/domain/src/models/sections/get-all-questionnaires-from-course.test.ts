import { type UUID } from "@fabric/core";
import { beforeEach, describe, expect, test } from "@fabric/testing";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../../services/mocks/create-mock-services.js";
import { createCourseMock } from "../mocks/create-course-mock.js";
import {
  createModuleMock,
  deleteModuleMock,
} from "../mocks/create-module-mock.js";
import {
  createQuestionnaireSectionMock,
  deleteQuestionnaireSectionMock,
} from "../mocks/create-questionnaire-section-mock.js";
import { createUnitMock, deleteUnitMock } from "../mocks/create-unit-mock.js";
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

  test("Should not count deleted modules", async () => {
    // Arrange - Add multiple questionnaire sections
    await createQuestionnaireSectionMock(services, user.id, existingUnitId);
    await createQuestionnaireSectionMock(services, user.id, existingUnitId);

    // Arrange - Delete the module
    await deleteModuleMock(services, user.id, existingModuleId);

    // Act
    const result = await getQuestionnairesCountFromCourse(
      services.state,
      existingCourseId,
    ).runOrThrow();

    // Assert
    expect(result).toBe(0);
  });

  test("Should return no questionnaires from a deleted module", async () => {
    // Arrange - Add multiple questionnaire sections
    await createQuestionnaireSectionMock(services, user.id, existingUnitId);
    await createQuestionnaireSectionMock(services, user.id, existingUnitId);

    // Arrange - Delete the module
    await deleteModuleMock(services, user.id, existingModuleId);

    // Act
    const result = await getQuestionnairesFromCourse(
      services.state,
      existingCourseId,
    ).runOrThrow();

    // Assert
    expect(result).toHaveLength(0);
  });
  test("Should not count questionnaires from deleted units", async () => {
    // Arrange - Add multiple questionnaire sections
    await createQuestionnaireSectionMock(services, user.id, existingUnitId);
    await createQuestionnaireSectionMock(services, user.id, existingUnitId);

    // Arrange - Delete the unit
    await deleteUnitMock(services, user.id, existingUnitId);

    // Act
    const result = await getQuestionnairesCountFromCourse(
      services.state,
      existingCourseId,
    ).runOrThrow();

    // Assert
    expect(result).toBe(0);
  });

  test("should not return questionnaires from deleted units", async () => {
    // Arrange - Add multiple questionnaire sections
    await createQuestionnaireSectionMock(services, user.id, existingUnitId);
    await createQuestionnaireSectionMock(services, user.id, existingUnitId);

    // Arrange - Delete the unit
    await deleteUnitMock(services, user.id, existingUnitId);

    // Act
    const result = await getQuestionnairesFromCourse(
      services.state,
      existingCourseId,
    ).runOrThrow();

    // Assert
    expect(result).toHaveLength(0);
  });

  test("should not count deleted questionnaires", async () => {
    // Arrange - Add multiple questionnaire sections
    const quizId = await createQuestionnaireSectionMock(
      services,
      user.id,
      existingUnitId,
    );
    await createQuestionnaireSectionMock(services, user.id, existingUnitId);

    // Arrange - Delete the unit
    await deleteQuestionnaireSectionMock(services, user.id, quizId);

    // Act
    const result = await getQuestionnairesCountFromCourse(
      services.state,
      existingCourseId,
    ).runOrThrow();

    // Assert
    expect(result).toBe(1);
  });

  test("should not return deleted questionnaires", async () => {
    // Arrange - Add multiple questionnaire sections
    const quizId = await createQuestionnaireSectionMock(
      services,
      user.id,
      existingUnitId,
    );
    await createQuestionnaireSectionMock(services, user.id, existingUnitId);

    // Arrange - Delete the unit
    await deleteQuestionnaireSectionMock(services, user.id, quizId);

    // Act
    const result = await getQuestionnairesFromCourse(
      services.state,
      existingCourseId,
    ).runOrThrow();

    // Assert
    expect(result).toHaveLength(1);
  });
});
