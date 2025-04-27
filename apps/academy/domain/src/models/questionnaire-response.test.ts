import { beforeEach, describe, expect, test } from "@fabric/testing";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../services/mocks/create-mock-services.js";
import {
  QuestionnaireResponseAddedEvent,
  QuestionnaireResponseProjector,
} from "./questionnaire-response.js";

describe("QuestionnaireResponse", () => {
  let services: MockedDependencies;

  beforeEach(async () => {
    services = await createServiceMocks();
  });

  test("Adding a questionnaire response", () => {
    // Setup
    const responseId = services.crypto.randomUUID();
    const questionnaireId = services.crypto.randomUUID();
    const userId = services.crypto.randomUUID();
    const answers = [1, 2, 3, 4];
    const score = 80;
    const questionnaireVersion = 1;

    // Create the questionnaire response event
    const event = QuestionnaireResponseAddedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: responseId,
      payload: {
        questionnaireId,
        questionnaireVersion,
        userId,
        answers,
        score,
      },
      version: 1,
    });

    // Project the event to create a questionnaire response
    const questionnaireResponse =
      QuestionnaireResponseProjector.project(event).unwrapOrThrow();

    // Assertions
    expect(questionnaireResponse).toEqual({
      id: responseId,
      questionnaireId,
      questionnaireVersion,
      userId,
      answers,
      score,
      version: 1,
      updatedAt: event.timestamp,
      createdAt: event.timestamp,
    });
  });
});
