/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { UUID } from "@fabric/core";
import { SchemaParsingError } from "@fabric/core";
import { beforeEach, describe, expect, test } from "@fabric/testing";
import { createCourseMock } from "../../../../../models/mocks/create-course-mock.js";
import { createModuleMock } from "../../../../../models/mocks/create-module-mock.js";
import { createUnitMock } from "../../../../../models/mocks/create-unit-mock.js";
import { createUserMock } from "../../../../../models/mocks/create-user-mock.js";
import type { User } from "../../../../../models/user.js";
import { Permission } from "../../../../../security/permission.js";
import type { MockedDependencies } from "../../../../../services/mocks/create-mock-services.js";
import { createServiceMocks } from "../../../../../services/mocks/create-mock-services.js";
import { UnauthorizedError } from "../../../../../utils/use-case.js";
import { UnitNotFoundError } from "../../../errors.js";
import {
  AddQuestionnaireSectionToUnitUseCase,
  type AddQuestionnaireSectionToUnitInput,
} from "./add-questionnaire-section-to-unit.js";

describe("AddQuestionnaireSectionToUnit", () => {
  let services: MockedDependencies;
  let user: User;
  let existingUnitId: UUID;

  beforeEach(async () => {
    services = await createServiceMocks();
    user = await createUserMock(services);

    const courseId = await createCourseMock(services, user.id);

    // Create a test module and unit
    const moduleId = await createModuleMock(services, user.id, courseId);

    // Mock a unit in the database
    existingUnitId = await createUnitMock(services, user.id, moduleId, {
      id: existingUnitId,
    });
  });

  test("Should successfully add a questionnaire section to a unit", async () => {
    // Arrange
    const input: AddQuestionnaireSectionToUnitInput = {
      unitId: existingUnitId,
      title: "Knowledge Check",
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
      randomizeQuestions: true,
    };

    // Act
    const result = await AddQuestionnaireSectionToUnitUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      input,
    ).runOrThrow();

    // Assert
    expect(result).toEqual({
      sectionId: expect.any(String),
    });

    // Verify event was written to the event store
    const sections = await services.state
      .from("questionnaireSections")
      .select()
      .runOrThrow();

    expect(sections).toHaveLength(1);

    const section = sections[0];

    expect(section).toEqual(
      expect.objectContaining({
        order: 100,
        title: "Knowledge Check",
        version: 1,
        content: {
          passingScore: 80,
          questions: [
            {
              options: [
                {
                  isCorrect: true,
                  text: "A programming language",
                },
                {
                  isCorrect: false,
                  text: "A database system",
                },
                {
                  isCorrect: false,
                  text: "A web framework",
                },
              ],
              questionText: "What is TypeScript?",
            },
            {
              options: [
                {
                  isCorrect: false,
                  text: "String",
                },
                {
                  isCorrect: true,
                  text: "string",
                },
                {
                  isCorrect: false,
                  text: "TEXT",
                },
              ],
              questionText: "Which of these is a valid TS type?",
            },
          ],
          randomizeQuestions: true,
        },
      }),
    );
  });

  test("Should fail when unit does not exist", async () => {
    // Arrange
    const nonExistingUnitId = services.crypto.randomUUID();
    const input: AddQuestionnaireSectionToUnitInput = {
      unitId: nonExistingUnitId,
      title: "Knowledge Check",
      questions: [
        {
          questionText: "What is TypeScript?",
          options: [
            { text: "A programming language", isCorrect: true },
            { text: "A database system", isCorrect: false },
          ],
        },
      ],
    };

    // Act
    const result = await AddQuestionnaireSectionToUnitUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      input,
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    const error = result.unwrapErrorOrThrow();
    expect(error).toBeInstanceOf(UnitNotFoundError);
    expect(error.message).toContain(nonExistingUnitId);
  });

  test("Should fail when questions array is empty", async () => {
    // Arrange
    const input = {
      unitId: existingUnitId,
      title: "Knowledge Check",
      questions: [], // Empty questions array
    };

    // Act
    const result = await AddQuestionnaireSectionToUnitUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      input,
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    const error = result.unwrapErrorOrThrow();
    expect(error).toBeInstanceOf(SchemaParsingError);
  });

  test("Should fail when user lacks the necessary permission", async () => {
    // Arrange
    const input: AddQuestionnaireSectionToUnitInput = {
      unitId: existingUnitId,
      title: "Knowledge Check",
      questions: [
        {
          questionText: "What is TypeScript?",
          options: [
            { text: "A programming language", isCorrect: true },
            { text: "A database system", isCorrect: false },
          ],
        },
      ],
    };

    // Act
    const result = await AddQuestionnaireSectionToUnitUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [], // No EDIT_COURSE permission
        },
      },
      input,
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    // Permission errors are handled by the UseCase base class
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(UnauthorizedError);
  });
});
