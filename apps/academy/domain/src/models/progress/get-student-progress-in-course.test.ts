import type { UUID } from "@fabric/core";
import { beforeEach, describe, expect, test } from "@fabric/testing";
import type { MockedDependencies } from "../../mocks.js";
import { createServiceMocks } from "../../mocks.js";
import {
  AddQuestionnaireResponseUseCase,
  EditQuestionnaireSectionContentUseCase,
} from "../../use-cases/index.js";
import { mockUserAccess } from "../../utils/mock-user-access.js";
import { createCourseMock } from "../mocks/create-course-mock.js";
import { createEnrollmentMock } from "../mocks/create-enrollment-mock.js";
import {
  createModuleMock,
  deleteModuleMock,
} from "../mocks/create-module-mock.js";
import { createQuestionnaireSectionMock } from "../mocks/create-questionnaire-section-mock.js";
import { createUnitMock } from "../mocks/create-unit-mock.js";
import { createUserMock } from "../mocks/create-user-mock.js";
import type { User } from "../user.js";
import { getStudentProgressInCourse } from "./get-student-progress-in-course.js";

describe("Get User Progress in Course", () => {
  let services: MockedDependencies;
  let user: User;
  let existingCourseId: UUID;
  let existingModuleId: UUID;
  let existingUnitId: UUID;
  let existingQuizId1: UUID;
  let existingQuizId2: UUID;
  let existingQuizId3: UUID;

  beforeEach(async () => {
    services = await createServiceMocks();

    // Create a test user
    user = await createUserMock(services);

    // Create a test course
    existingCourseId = await createCourseMock(services, user.id);

    // Create a module for the course
    existingModuleId = await createModuleMock(
      services,
      user.id,
      existingCourseId,
    );

    // Create a unit for the module
    existingUnitId = await createUnitMock(services, user.id, existingModuleId);

    existingQuizId1 = await createQuestionnaireSectionMock(
      services,
      user.id,
      existingUnitId,
      {
        title: "Quiz 1",
      },
    );
    existingQuizId2 = await createQuestionnaireSectionMock(
      services,
      user.id,
      existingUnitId,
      {
        title: "Quiz 2",
      },
    );
    existingQuizId3 = await createQuestionnaireSectionMock(
      services,
      user.id,
      existingUnitId,
      {
        title: "Quiz 3",
      },
    );

    await createEnrollmentMock(services, user.id, existingCourseId);
  });

  test("Should return student progress in course", async () => {
    // Arrange - Add questionnaire responses for the user
    await mockCorrectQuizResponse(existingQuizId1, 1);
    await mockCorrectQuizResponse(existingQuizId2, 1);
    await mockWrongQuizResponse(existingQuizId3, 1);
    // Act
    const result = await getStudentProgressInCourse(
      services.state,
      existingCourseId,
      user.id,
    ).runOrThrow();

    // Assert
    expect(result).toEqual([
      {
        responseVersion: 1,
        quizVersion: 1,
        quizTitle: "Quiz 1",
        score: 100,
      },
      {
        responseVersion: 1,
        quizVersion: 1,
        quizTitle: "Quiz 2",
        score: 100,
      },
      {
        responseVersion: 1,
        quizVersion: 1,
        quizTitle: "Quiz 3",
        score: 0,
      },
    ]);
  });

  test("Should return empty array if no progress found", async () => {
    // Arrange - Create a new user with no progress
    const newUser = await createUserMock(services);

    // Act
    const result = await getStudentProgressInCourse(
      services.state,
      existingCourseId,
      newUser.id,
    ).runOrThrow();

    // Assert
    expect(result).toEqual([]);
  });

  test("If a quiz gets updated after a response is submitted, the progress should ignore the old response", async () => {
    // Arrange - Create a new user and submit a response
    await mockCorrectQuizResponse(existingQuizId1, 1);

    // Act - Update the quiz and submit a new response
    await updateQuiz(existingQuizId1);

    const result = await getStudentProgressInCourse(
      services.state,
      existingCourseId,
      user.id,
    ).runOrThrow();

    // Assert
    expect(result).toEqual([]);
  });

  test("Given a deleted module, it should not count for the progress", async () => {
    // Arrange - Create a new user and submit a response
    await mockCorrectQuizResponse(existingQuizId1, 1);
    await mockCorrectQuizResponse(existingQuizId2, 1);
    await mockWrongQuizResponse(existingQuizId3, 1);

    // Act - Delete the module and check progress
    await deleteModuleMock(services, user.id, existingModuleId);

    const result = await getStudentProgressInCourse(
      services.state,
      existingCourseId,
      user.id,
    ).runOrThrow();

    // Assert
    expect(result).toEqual([]);
  });

  async function mockCorrectQuizResponse(
    questionnaireId: UUID,
    version: number,
  ) {
    await AddQuestionnaireResponseUseCase.call(
      {
        ...services,
        currentUser: mockUserAccess(services, [], user.id),
      },
      {
        questionnaireId,
        questionnaireVersion: version,
        answers: [0], //for default mock, assume 0 is correct
      },
    ).runOrThrow();
  }
  async function mockWrongQuizResponse(questionnaireId: UUID, version: number) {
    await AddQuestionnaireResponseUseCase.call(
      {
        ...services,
        currentUser: mockUserAccess(services, [], user.id),
      },
      {
        questionnaireId,
        questionnaireVersion: version,
        answers: [1], //for default mock, assume 1 is wrong
      },
    ).runOrThrow();
  }

  async function updateQuiz(questionnaireId: UUID) {
    await EditQuestionnaireSectionContentUseCase.call(
      {
        ...services,
        currentUser: mockUserAccess(services, ["EDIT_COURSE"], user.id),
      },
      {
        sectionId: questionnaireId,
        title: "Updated Quiz Title",
        questions: [
          {
            questionText: "Updated Question",
            options: [
              { text: "Updated Answer 1", isCorrect: true },
              { text: "Updated Answer 2", isCorrect: false },
            ],
          },
        ],
      },
    ).runOrThrow();
  }
});
