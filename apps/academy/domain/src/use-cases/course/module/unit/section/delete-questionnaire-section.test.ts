import type { UUID } from "@fabric/core";
import { beforeEach, describe, expect, test } from "@fabric/testing";
import { createCourseMock } from "../../../../../models/mocks/create-course-mock.js";
import { createModuleMock } from "../../../../../models/mocks/create-module-mock.js";
import { createQuestionnaireSectionMock } from "../../../../../models/mocks/create-questionnaire-section-mock.js";
import { createUnitMock } from "../../../../../models/mocks/create-unit-mock.js";
import { createUserMock } from "../../../../../models/mocks/create-user-mock.js";
import type { User } from "../../../../../models/user.js";
import { Permission } from "../../../../../security/permission.js";
import { UserRole } from "../../../../../security/user-role.js";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../../../../../services/mocks/create-mock-services.js";
import { UnauthorizedError } from "../../../../../utils/use-case.js";
import { QuestionnaireSectionNotFoundError } from "../../../errors.js";
import { DeleteQuestionnaireSectionUseCase } from "./delete-questionnaire-section.js";

describe("Delete Questionnaire Section Use Case", () => {
  let services: MockedDependencies;
  let user: User;
  let existingQuestionnaireSectionId: UUID;
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
      description: "A course for testing questionnaire section deletion",
    });

    // Add a module to the course
    existingModuleId = await createModuleMock(
      services,
      user.id,
      existingCourseId,
      {
        title: "Test Module",
        description: "A module for testing questionnaire section deletion",
      },
    );

    // Add a unit to the module
    existingUnitId = await createUnitMock(services, user.id, existingModuleId, {
      title: "Test Unit",
    });

    // Add a questionnaire section to the unit
    existingQuestionnaireSectionId = await createQuestionnaireSectionMock(
      services,
      user.id,
      existingUnitId,
      {
        title: "Questionnaire section to delete",
        content: {
          questions: [
            {
              questionText: "What is the correct answer?",
              options: [
                { text: "Option A", isCorrect: true },
                { text: "Option B", isCorrect: false },
              ],
            },
          ],
          questionsToShow: 1,
          randomizeQuestions: false,
          passingScore: 80,
        },
      },
    );
  });

  test("Admin should successfully delete a questionnaire section", async () => {
    // Arrange
    const deleteData = {
      sectionId: existingQuestionnaireSectionId,
    };

    // Act
    await DeleteQuestionnaireSectionUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      deleteData,
    ).runOrThrow();

    // Verify the questionnaire section was soft-deleted in the database
    const deletedQuestionnaireSection = await services.state
      .from("questionnaireSections")
      .where({ id: existingQuestionnaireSectionId })
      .selectOneOrFail()
      .runOrThrow();

    expect(deletedQuestionnaireSection).toEqual(
      expect.objectContaining({
        title: "Questionnaire section to delete",
        unitId: existingUnitId,
      }),
    );

    // Check that deletedAt is a PosixDate with a timestamp
    expect(deletedQuestionnaireSection.deletedAt).toBeDefined();
    expect(deletedQuestionnaireSection.deletedAt?.timestamp).toEqual(
      expect.any(Number),
    );
  });

  test("Deleting an already deleted questionnaire section should succeed (idempotent)", async () => {
    // Arrange - First delete the questionnaire section
    const deleteData = {
      sectionId: existingQuestionnaireSectionId,
    };

    await DeleteQuestionnaireSectionUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      deleteData,
    ).runOrThrow();

    // Act - Delete the same questionnaire section again
    await DeleteQuestionnaireSectionUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      deleteData,
    ).runOrThrow();

    // Verify the questionnaire section is still deleted
    const deletedQuestionnaireSection = await services.state
      .from("questionnaireSections")
      .where({ id: existingQuestionnaireSectionId })
      .selectOneOrFail()
      .runOrThrow();

    expect(deletedQuestionnaireSection.deletedAt).toBeDefined();
    expect(deletedQuestionnaireSection.deletedAt?.timestamp).toEqual(
      expect.any(Number),
    );
  });

  test("Should fail when questionnaire section doesn't exist", async () => {
    // Arrange
    const nonExistentSectionId = "00000000-0000-0000-0000-000000000000";
    const deleteData = {
      sectionId: nonExistentSectionId,
    };

    // Act
    const result = await DeleteQuestionnaireSectionUseCase.call(
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
    expect(error).toBeInstanceOf(QuestionnaireSectionNotFoundError);
  });

  test("Should fail when user doesn't have EDIT_COURSE permission", async () => {
    // Arrange
    const deleteData = {
      sectionId: existingQuestionnaireSectionId,
    };

    // Act
    const result = await DeleteQuestionnaireSectionUseCase.call(
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

    // Verify questionnaire section was not deleted
    const unchangedQuestionnaireSection = await services.state
      .from("questionnaireSections")
      .where({ id: existingQuestionnaireSectionId })
      .selectOneOrFail()
      .runOrThrow();

    expect(unchangedQuestionnaireSection.deletedAt).toBeNull();
  });

  test("Should fail with invalid sectionId", async () => {
    // Arrange
    const deleteData = {
      sectionId: "invalid-uuid",
    };

    // Act
    const result = await DeleteQuestionnaireSectionUseCase.call(
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
