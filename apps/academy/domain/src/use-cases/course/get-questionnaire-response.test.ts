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
import { QuestionnaireResponseNotFoundError } from "./errors.js";
import { GetQuestionnaireResponseUseCase } from "./get-questionnaire-response.js";

describe("Get Questionnaire Response Use Case", () => {
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

  test("User should be able to retrieve their questionnaire response", async () => {
    // Arrange - First submit a response
    const answers = [0, 1]; // Correct answers
    const submitInput = {
      questionnaireId,
      questionnaireVersion: 1,
      answers,
    };

    // Submit the response
    await AddQuestionnaireResponseUseCase.call(
      {
        ...services,
        currentUser: {
          id: userId,
          permissions: [],
        },
      },
      submitInput,
    ).runOrThrow();

    // Act - Retrieve the response
    const getInput = {
      questionnaireId,
    };

    const result = await GetQuestionnaireResponseUseCase.call(
      {
        ...services,
        currentUser: {
          id: userId,
          permissions: [],
        },
      },
      getInput,
    ).runOrThrow();

    // Assert
    expect(result.response).toBeDefined();
    expect(result.response.questionnaireId).toBe(questionnaireId);
    expect(result.response.userId).toBe(userId);
    expect(result.response.answers).toEqual(answers);
    expect(result.response.score).toBe(100); // All answers correct
    expect(result.response.questionnaireVersion).toBe(1);
  });

  test("Should fail with QuestionnaireResponseNotFoundError when response doesn't exist", async () => {
    // Arrange - No submission made
    const getInput = {
      questionnaireId,
    };

    // Act
    const result = await GetQuestionnaireResponseUseCase.call(
      {
        ...services,
        currentUser: {
          id: userId,
          permissions: [],
        },
      },
      getInput,
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    const error = result.unwrapErrorOrThrow();
    expect(error).toBeInstanceOf(QuestionnaireResponseNotFoundError);
    expect((error as QuestionnaireResponseNotFoundError).questionnaireId).toBe(
      questionnaireId,
    );
    expect((error as QuestionnaireResponseNotFoundError).userId).toBe(userId);
  });

  test("User should only see their own questionnaire responses", async () => {
    // Arrange - Create another user and submit a response for them
    const anotherUser = await createUserMock(services);
    const anotherUserId = anotherUser.id;

    // Submit a response for the first user
    await AddQuestionnaireResponseUseCase.call(
      {
        ...services,
        currentUser: {
          id: userId,
          permissions: [],
        },
      },
      {
        questionnaireId,
        questionnaireVersion: 1,
        answers: [0, 1],
      },
    ).runOrThrow();

    // Act - Try to retrieve the response as the second user
    const result = await GetQuestionnaireResponseUseCase.call(
      {
        ...services,
        currentUser: {
          id: anotherUserId,
          permissions: [],
        },
      },
      {
        questionnaireId,
      },
    ).run();

    // Assert - Second user should not see first user's response
    expect(result.isError()).toBe(true);
    const error = result.unwrapErrorOrThrow();
    expect(error).toBeInstanceOf(QuestionnaireResponseNotFoundError);
  });
});
