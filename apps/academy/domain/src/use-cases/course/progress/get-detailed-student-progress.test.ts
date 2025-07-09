import type { UUID } from "@fabric/core";
import { beforeEach, describe, expect, test } from "@fabric/testing";
import type { MockedDependencies } from "../../../mocks.js";
import { createServiceMocks } from "../../../mocks.js";
import { createCourseMock } from "../../../models/mocks/create-course-mock.js";
import { createEnrollmentMock } from "../../../models/mocks/create-enrollment-mock.js";
import { createModuleMock } from "../../../models/mocks/create-module-mock.js";
import { createQuestionnaireSectionMock } from "../../../models/mocks/create-questionnaire-section-mock.js";
import { createUnitMock } from "../../../models/mocks/create-unit-mock.js";
import { createUserMock } from "../../../models/mocks/create-user-mock.js";
import type { User } from "../../../models/user.js";
import type { UserAccess } from "../../../services/auth-service.js";
import { mockUserAccess } from "../../../utils/mock-user-access.js";
import { AddQuestionnaireResponseUseCase } from "../add-questionnaire-response.js";
import { EditQuestionnaireSectionContentUseCase } from "../module/index.js";
import { GetDetailedStudentProgressUseCase } from "./get-detailed-student-progress.js";

describe("GetDetailedStudentProgress Use Case", () => {
  let courseId: UUID;
  let services: MockedDependencies;
  let user: User;
  let module1Id: UUID;
  let unit1: UUID;
  let unit2: UUID;
  let quiz1: UUID;
  let quiz2: UUID;
  let currentUser: UserAccess;

  beforeEach(async () => {
    services = await createServiceMocks();
    user = await createUserMock(services, { role: "ADMIN" });
    courseId = await createCourseMock(services, user.id);

    module1Id = await createModuleMock(services, user.id, courseId);

    unit1 = await createUnitMock(services, user.id, module1Id);
    unit2 = await createUnitMock(services, user.id, module1Id);

    quiz1 = await createQuestionnaireSectionMock(services, user.id, unit1, {
      title: "Quiz 1",
    });
    quiz2 = await createQuestionnaireSectionMock(services, user.id, unit2, {
      title: "Quiz 2",
    });

    await createEnrollmentMock(services, user.id, courseId);

    currentUser = mockUserAccess(services, ["LIST_USERS"], user.id);
  });

  test("should return correct progress when all quizzes are correctly done", async () => {
    await mockCorrectQuizResponse(quiz1, user.id, 1);
    await mockCorrectQuizResponse(quiz2, user.id, 1);

    const result = await GetDetailedStudentProgressUseCase.call(
      {
        ...services,
        currentUser,
      },
      {
        moduleId: module1Id,
        studentId: user.id,
      },
    ).runOrThrow();

    expect(result).toEqual({
      progress: 100,
      quizzes: [
        {
          quizId: quiz1,
          quizTitle: "Quiz 1",
          score: 100,
          attempts: 1,
          isCurrentVersion: true,
        },
        {
          quizId: quiz2,
          quizTitle: "Quiz 2",
          score: 100,
          attempts: 1,
          isCurrentVersion: true,
        },
      ],
    });
  });

  test("should return correct progress when quizzes change", async () => {
    await mockCorrectQuizResponse(quiz1, user.id, 1);
    await mockCorrectQuizResponse(quiz2, user.id, 1);

    await updateQuiz(quiz2);

    const result = await GetDetailedStudentProgressUseCase.call(
      {
        ...services,
        currentUser,
      },
      {
        moduleId: module1Id,
        studentId: user.id,
      },
    ).runOrThrow();

    expect(result).toEqual({
      progress: 50,
      quizzes: [
        {
          quizId: quiz1,
          quizTitle: "Quiz 1",
          score: 100,
          attempts: 1,
          isCurrentVersion: true,
        },
        {
          quizId: quiz2,
          quizTitle: "Updated Quiz Title",
          score: 100,
          attempts: 1,
          isCurrentVersion: false,
        },
      ],
    });
  });

  test("should return correct progress with wrong quiz responses", async () => {
    await mockWrongQuizResponse(quiz1, user.id, 1);
    await mockCorrectQuizResponse(quiz2, user.id, 1);

    const result = await GetDetailedStudentProgressUseCase.call(
      {
        ...services,
        currentUser,
      },
      {
        moduleId: module1Id,
        studentId: user.id,
      },
    ).runOrThrow();

    expect(result).toEqual({
      progress: 50,
      quizzes: [
        {
          quizId: quiz1,
          quizTitle: "Quiz 1",
          score: 0,
          isCurrentVersion: true,
          attempts: 1,
        },
        {
          quizId: quiz2,
          quizTitle: "Quiz 2",
          score: 100,
          isCurrentVersion: true,
          attempts: 1,
        },
      ],
    });
  });

  async function mockCorrectQuizResponse(
    questionnaireId: UUID,
    userId: UUID,
    version: number,
  ) {
    await AddQuestionnaireResponseUseCase.call(
      {
        ...services,
        currentUser: mockUserAccess(services, [], userId),
      },
      {
        questionnaireId,
        questionnaireVersion: version,
        answers: [0],
      },
    ).runOrThrow();
  }
  async function mockWrongQuizResponse(
    questionnaireId: UUID,
    userId: UUID,
    version: number,
  ) {
    await AddQuestionnaireResponseUseCase.call(
      {
        ...services,
        currentUser: mockUserAccess(services, [], userId),
      },
      {
        questionnaireId,
        questionnaireVersion: version,
        answers: [1],
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
