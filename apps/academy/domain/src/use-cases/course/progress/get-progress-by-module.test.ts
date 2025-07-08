import type { UUID } from "@fabric/core";
import { beforeEach, describe, expect, test } from "@fabric/testing";
import { createServiceMocks, type MockedDependencies } from "../../../mocks.js";
import { createCourseMock } from "../../../models/mocks/create-course-mock.js";
import { createEnrollmentMock } from "../../../models/mocks/create-enrollment-mock.js";
import { createModuleMock } from "../../../models/mocks/create-module-mock.js";
import { createQuestionnaireSectionMock } from "../../../models/mocks/create-questionnaire-section-mock.js";
import { createUnitMock } from "../../../models/mocks/create-unit-mock.js";
import { createUserMock } from "../../../models/mocks/create-user-mock.js";
import type { User } from "../../../models/user.js";
import type { UserAccess } from "../../../services/auth-service.js";
import { mockUserAccess } from "../../../utils/mock-user-access.js";
import { UnauthorizedError } from "../../../utils/use-case.js";
import { AddQuestionnaireResponseUseCase } from "../add-questionnaire-response.js";
import { ModuleNotFoundError } from "../errors.js";
import { EditQuestionnaireSectionContentUseCase } from "../module/index.js";
import { GetProgressByModuleUseCase } from "./get-progress-by-module.js";

describe("getModuleProgress", () => {
  let services: MockedDependencies;
  let user1: User;
  let user2: User;
  let courseId: UUID;
  let module1Id: UUID;
  let unit1: UUID;
  let unit2: UUID;
  let quiz1: UUID;
  let quiz2: UUID;
  let currentUser: UserAccess;

  beforeEach(async () => {
    services = await createServiceMocks();

    user1 = await createUserMock(services);
    user2 = await createUserMock(services);

    courseId = await createCourseMock(services, user1.id);

    module1Id = await createModuleMock(services, user1.id, courseId);

    unit1 = await createUnitMock(services, user1.id, module1Id);
    unit2 = await createUnitMock(services, user1.id, module1Id);

    quiz1 = await createQuestionnaireSectionMock(services, user1.id, unit1, {
      title: "Quiz 1",
    });
    quiz2 = await createQuestionnaireSectionMock(services, user1.id, unit2, {
      title: "Quiz 2",
    });

    await createEnrollmentMock(services, user1.id, courseId);
    await createEnrollmentMock(services, user2.id, courseId);

    currentUser = mockUserAccess(services, ["LIST_USERS"], user1.id);
  });

  test("should return correct progress for users with correct quiz responses", async () => {
    await mockCorrectQuizResponse(quiz1, user1.id, 1);
    await mockCorrectQuizResponse(quiz2, user1.id, 1);
    await mockCorrectQuizResponse(quiz1, user2.id, 1);
    await mockCorrectQuizResponse(quiz2, user2.id, 1);

    const result = await GetProgressByModuleUseCase.call(
      {
        ...services,
        currentUser,
      },
      {
        moduleId: module1Id,
      },
    ).runOrThrow();

    expect(result.progress).toEqual(100);
  });
  test("should return correct progress for users with correct quiz responses", async () => {
    await mockCorrectQuizResponse(quiz1, user1.id, 1);
    await mockWrongQuizResponse(quiz2, user1.id, 1);
    await mockCorrectQuizResponse(quiz1, user2.id, 1);
    await mockWrongQuizResponse(quiz2, user2.id, 1);

    const result = await GetProgressByModuleUseCase.call(
      {
        ...services,
        currentUser,
      },
      {
        moduleId: module1Id,
      },
    ).runOrThrow();

    expect(result.progress).toEqual(50);
  });

  test("should return correct progress for users with correct quiz responses", async () => {
    await mockCorrectQuizResponse(quiz1, user1.id, 1);
    await mockWrongQuizResponse(quiz2, user1.id, 1);
    await mockCorrectQuizResponse(quiz1, user2.id, 1);
    await mockCorrectQuizResponse(quiz2, user2.id, 1);

    const result = await GetProgressByModuleUseCase.call(
      {
        ...services,
        currentUser,
      },
      {
        moduleId: module1Id,
      },
    ).runOrThrow();

    expect(result.progress).toEqual(75);
  });

  test("If a test gets updated the progress should reflect the changes", async () => {
    await mockCorrectQuizResponse(quiz1, user1.id, 1);
    await mockCorrectQuizResponse(quiz2, user1.id, 1);
    await mockCorrectQuizResponse(quiz1, user2.id, 1);
    await mockCorrectQuizResponse(quiz2, user2.id, 1);

    await updateQuiz(quiz1);

    const result = await GetProgressByModuleUseCase.call(
      {
        ...services,
        currentUser,
      },
      {
        moduleId: module1Id,
      },
    ).runOrThrow();

    expect(result.progress).toEqual(50);
  });

  test("Should fail if user does not have permission", async () => {
    const unauthorizedUser = mockUserAccess(services, [], user1.id);

    await expect(
      GetProgressByModuleUseCase.call(
        {
          ...services,
          currentUser: unauthorizedUser,
        },
        {
          moduleId: module1Id,
        },
      ).runOrThrow(),
    ).rejects.toThrow(UnauthorizedError);
  });

  test("Should fail if module does not exist", async () => {
    const nonExistentModuleId = "00000000-0000-0000-0000-000000000000" as UUID;

    await expect(
      GetProgressByModuleUseCase.call(
        {
          ...services,
          currentUser,
        },
        {
          moduleId: nonExistentModuleId,
        },
      ).runOrThrow(),
    ).rejects.toThrow(ModuleNotFoundError);
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
        currentUser: mockUserAccess(services, ["EDIT_COURSE"], user1.id),
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
