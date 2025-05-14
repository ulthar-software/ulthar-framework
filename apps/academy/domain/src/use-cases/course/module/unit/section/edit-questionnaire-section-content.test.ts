import { type UUID } from "@fabric/core";
import { beforeEach, describe, expect, test } from "@fabric/testing";
import { createCourseMock } from "../../../../../models/mocks/create-course-mock.js";
import { createModuleMock } from "../../../../../models/mocks/create-module-mock.js";
import { createQuestionnaireSectionMock } from "../../../../../models/mocks/create-questionnaire-section-mock.js";
import { createUnitMock } from "../../../../../models/mocks/create-unit-mock.js";
import { createUserMock } from "../../../../../models/mocks/create-user-mock.js";
import type { User } from "../../../../../models/user.js";
import { Permission } from "../../../../../security/permission.js";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../../../../../services/mocks/create-mock-services.js";
import { UnauthorizedError } from "../../../../../utils/use-case.js";
import { QuestionnaireSectionNotFoundError } from "../../../errors.js";
import { EditQuestionnaireSectionContentUseCase } from "./edit-questionnaire-section-content.js";

describe("Edit Questionnaire Section Content Use Case", () => {
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

    // Add a questionnaire section to the unit
    existingSectionId = await createQuestionnaireSectionMock(
      services,
      user.id,
      unitId,
      {
        title: "Initial Questionnaire",
        content: {
          questions: [
            {
              questionText: "What is 2 + 2?",
              options: [
                { text: "3", isCorrect: false },
                { text: "4", isCorrect: true },
              ],
            },
          ],
        },
      },
    );
  });

  test("Admin should successfully edit a questionnaire section content", async () => {
    // Arrange
    const updatedContent = {
      sectionId: existingSectionId,
      title: "Updated Questionnaire",
      questions: [
        {
          questionText: "What is 3 + 3?",
          options: [
            { text: "5", isCorrect: false },
            { text: "6", isCorrect: true },
          ],
        },
      ],
      questionsToShow: 1,
      randomizeQuestions: true,
      passingScore: 80,
    };

    // Act
    const result = await EditQuestionnaireSectionContentUseCase.call(
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
      .from("questionnaireSections")
      .where({ id: existingSectionId })
      .selectOneOrFail()
      .runOrThrow();

    expect(sectionInDb.content).toEqual(
      expect.objectContaining({
        questions: updatedContent.questions,
        questionsToShow: updatedContent.questionsToShow,
        randomizeQuestions: updatedContent.randomizeQuestions,
        passingScore: updatedContent.passingScore,
      }),
    );
  });

  test("Should fail when editing a non-existent section", async () => {
    // Arrange
    const invalidSectionId = "00000000-0000-0000-0000-000000000000";
    const updatedContent = {
      sectionId: invalidSectionId,
      title: "Invalid Questionnaire",
      questions: [
        {
          questionText: "What is 3 + 3?",
          options: [
            { text: "5", isCorrect: false },
            { text: "6", isCorrect: true },
          ],
        },
      ],
    };

    // Act
    const result = await EditQuestionnaireSectionContentUseCase.call(
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
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(
      QuestionnaireSectionNotFoundError,
    );
  });

  test("Should fail when user lacks EDIT_COURSE permission", async () => {
    // Arrange
    const updatedContent = {
      sectionId: existingSectionId,
      title: "Unauthorized Questionnaire",
      questions: [],
    };

    // Act
    const result = await EditQuestionnaireSectionContentUseCase.call(
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
