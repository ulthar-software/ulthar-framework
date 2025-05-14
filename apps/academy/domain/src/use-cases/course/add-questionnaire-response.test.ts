import type { UUID } from "@fabric/core";
import { beforeEach, describe, expect, test } from "@fabric/testing";
import { createCourseMock } from "../../models/mocks/create-course-mock.js";
import { createModuleMock } from "../../models/mocks/create-module-mock.js";
import { createQuestionnaireSectionMock } from "../../models/mocks/create-questionnaire-section-mock.js";
import { createUnitMock } from "../../models/mocks/create-unit-mock.js";
import { createUserMock } from "../../models/mocks/create-user-mock.js";
import type { QuestionnaireSectionContent } from "../../models/sections/questionnaire-section.js";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../../services/mocks/create-mock-services.js";
import { AddQuestionnaireResponseUseCase } from "./add-questionnaire-response.js";
import {
  IncompleteQuestionnaireResponseError,
  QuestionnaireSectionNotFoundError,
  QuestionnaireVersionMismatchError,
} from "./errors.js";

describe("Add Questionnaire Response Use Case", () => {
  let services: MockedDependencies;
  let userId: UUID;
  let unitId: UUID;
  let questionnaireId: UUID;
  let questionnaireContent: QuestionnaireSectionContent;

  beforeEach(async () => {
    services = await createServiceMocks();

    // Create a test user
    const user = await createUserMock(services);
    userId = user.id;

    const courseId = await createCourseMock(services, userId);

    const moduleId = await createModuleMock(services, userId, courseId);

    // Create a test unit
    unitId = await createUnitMock(services, userId, moduleId);

    // Define questionnaire content with specific questions
    questionnaireContent = {
      questions: [
        {
          questionText: "What is TypeScript?",
          options: [
            { text: "A programming language", isCorrect: true },
            { text: "A database system", isCorrect: false },
            { text: "A web framework", isCorrect: false },
          ],
        },
        {
          questionText: "Which of these is a valid TS type?",
          options: [
            { text: "String", isCorrect: false },
            { text: "string", isCorrect: true },
            { text: "TEXT", isCorrect: false },
          ],
        },
      ],
      passingScore: 80,
    };

    // Create a questionnaire section
    questionnaireId = await createQuestionnaireSectionMock(
      services,
      userId,
      unitId,
      {
        content: questionnaireContent,
      },
    );
  });

  test("User should be able to submit correct answers and get a perfect score", async () => {
    // Arrange - Correct answers are indexes of correct options (first question: index 0, second question: index 1)
    const correctAnswers = [0, 1];

    const input = {
      questionnaireId,
      questionnaireVersion: 1, // Initial version is 1
      answers: correctAnswers,
    };

    // Act
    await AddQuestionnaireResponseUseCase.call(
      {
        ...services,
        currentUser: {
          id: userId,
          permissions: [],
        },
      },
      input,
    ).runOrThrow();

    // Assert
    // Check that the response has been stored properly
    const responses = await services.state
      .from("questionnaireResponses")
      .where({ questionnaireId })
      .select()
      .runOrThrow();

    expect(responses).toHaveLength(1);
    expect(responses[0]).toMatchObject({
      questionnaireId,
      questionnaireVersion: 1,
      userId,
      answers: correctAnswers,
      score: 100, // All answers correct
    });
  });

  test("User should be able to submit partially correct answers and get a partial score", async () => {
    // Arrange - Mix of correct and incorrect answers
    const partiallyCorrectAnswers = [0, 0]; // First correct, second incorrect

    const input = {
      questionnaireId,
      questionnaireVersion: 1,
      answers: partiallyCorrectAnswers,
    };

    // Act
    await AddQuestionnaireResponseUseCase.call(
      {
        ...services,
        currentUser: {
          id: userId,
          permissions: [],
        },
      },
      input,
    ).runOrThrow();

    // Assert
    const responses = await services.state
      .from("questionnaireResponses")
      .where({ questionnaireId })
      .select()
      .runOrThrow();

    expect(responses).toHaveLength(1);
    expect(responses[0]).toMatchObject({
      questionnaireId,
      questionnaireVersion: 1,
      userId,
      answers: partiallyCorrectAnswers,
      score: 50, // 1 out of 2 correct = 50%
    });
  });

  test("Should fail with QuestionnaireSectionNotFoundError when questionnaire doesn't exist", async () => {
    // Arrange
    const nonExistentQuestionnaireId = "00000000-0000-0000-0000-000000000000";
    const input = {
      questionnaireId: nonExistentQuestionnaireId,
      questionnaireVersion: 1,
      answers: [0, 1],
    };

    // Act
    const result = await AddQuestionnaireResponseUseCase.call(
      {
        ...services,
        currentUser: {
          id: userId,
          permissions: [],
        },
      },
      input,
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    const error = result.unwrapErrorOrThrow();
    expect(error).toBeInstanceOf(QuestionnaireSectionNotFoundError);
    expect((error as QuestionnaireSectionNotFoundError).sectionId).toBe(
      nonExistentQuestionnaireId,
    );
  });

  test("Should fail with QuestionnaireVersionMismatchError when version doesn't match", async () => {
    // Arrange
    const input = {
      questionnaireId,
      questionnaireVersion: 99, // Wrong version - should be 1
      answers: [0, 1],
    };

    // Act
    const result = await AddQuestionnaireResponseUseCase.call(
      {
        ...services,
        currentUser: {
          id: userId,
          permissions: [],
        },
      },
      input,
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    const error = result.unwrapErrorOrThrow();
    expect(error).toBeInstanceOf(QuestionnaireVersionMismatchError);
    expect((error as QuestionnaireVersionMismatchError).questionnaireId).toBe(
      questionnaireId,
    );
    expect((error as QuestionnaireVersionMismatchError).expectedVersion).toBe(
      99,
    );
    expect((error as QuestionnaireVersionMismatchError).actualVersion).toBe(1);
  });

  test("Should fail with IncompleteQuestionnaireResponseError when not all questions are answered", async () => {
    // Arrange - Only answering 1 of 2 questions
    const incompleteAnswers = [0];

    const input = {
      questionnaireId,
      questionnaireVersion: 1,
      answers: incompleteAnswers,
    };

    // Act
    const result = await AddQuestionnaireResponseUseCase.call(
      {
        ...services,
        currentUser: {
          id: userId,
          permissions: [],
        },
      },
      input,
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    const error = result.unwrapErrorOrThrow();
    expect(error).toBeInstanceOf(IncompleteQuestionnaireResponseError);
  });

  test("Should handle user without permissions correctly", async () => {
    // Arrange
    const input = {
      questionnaireId,
      questionnaireVersion: 1,
      answers: [0, 1],
    };

    // Act - This should succeed since we only check that the user is authenticated
    await AddQuestionnaireResponseUseCase.call(
      {
        ...services,
        currentUser: {
          id: userId,
          permissions: [], // No special permissions
        },
      },
      input,
    ).runOrThrow();

    // Assert
    const responses = await services.state
      .from("questionnaireResponses")
      .where({ questionnaireId })
      .select()
      .runOrThrow();

    expect(responses).toHaveLength(1);
  });
});
