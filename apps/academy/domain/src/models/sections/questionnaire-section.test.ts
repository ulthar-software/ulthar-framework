import { beforeEach, describe, expect, test } from "@fabric/testing";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../../services/mocks/create-mock-services.js";
import {
  QuestionnaireSectionAddedEvent,
  QuestionnaireSectionContentChangedEvent,
  QuestionnaireSectionProjector,
} from "./questionnaire-section.js";
import { SectionOrderChangedEvent } from "./section-base.js";

describe("Questionnaire Section", () => {
  let services: MockedDependencies;

  beforeEach(async () => {
    services = await createServiceMocks();
  });

  test("Creating a QuestionnaireSection", () => {
    const sectionId = services.crypto.randomUUID();
    const unitId = services.crypto.randomUUID();
    const createdBy = services.crypto.randomUUID();

    const event = QuestionnaireSectionAddedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: sectionId,
      payload: {
        title: "Knowledge Check",
        content: {
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
        },
        unitId,
        order: 3,
        createdBy,
      },
      version: 1,
    });

    const section =
      QuestionnaireSectionProjector.project(event).unwrapOrThrow();

    expect(section).toEqual({
      id: sectionId,
      title: "Knowledge Check",
      content: {
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
      },
      unitId,
      order: 3,
      createdBy,
      version: 1,
      updatedAt: event.timestamp,
      createdAt: event.timestamp,
    });
  });

  test("Updating a QuestionnaireSection content", () => {
    // First create a questionnaire section
    const sectionId = services.crypto.randomUUID();
    const unitId = services.crypto.randomUUID();
    const createdBy = services.crypto.randomUUID();

    const addEvent = QuestionnaireSectionAddedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: sectionId,
      payload: {
        title: "Quiz",
        content: {
          questions: [
            {
              questionText: "Original question?",
              options: [
                { text: "Option A", isCorrect: true },
                { text: "Option B", isCorrect: false },
              ],
            },
          ],
          passingScore: 70,
        },
        unitId,
        order: 3,
        createdBy,
      },
      version: 1,
    });

    const section =
      QuestionnaireSectionProjector.project(addEvent).unwrapOrThrow();
    if (!section) throw new Error("Section was not created");

    // Then update the content
    const contentChangeEvent = QuestionnaireSectionContentChangedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: sectionId,
      payload: {
        title: "Updated Quiz",
        content: {
          questions: [
            {
              questionText: "Updated question?",
              options: [
                { text: "Option A", isCorrect: false },
                { text: "Option B", isCorrect: true },
                { text: "Option C", isCorrect: false },
              ],
            },
            {
              questionText: "New question?",
              options: [
                { text: "Option X", isCorrect: true },
                { text: "Option Y", isCorrect: false },
              ],
            },
          ],
          passingScore: 80,
        },
        updatedBy: services.crypto.randomUUID(),
      },
      version: 2,
    });

    const updatedSection = QuestionnaireSectionProjector.project(
      contentChangeEvent,
      section,
    ).unwrapOrThrow();

    expect(updatedSection).toEqual({
      id: sectionId,
      title: "Updated Quiz", // Changed
      content: {
        questions: [
          {
            questionText: "Updated question?",
            options: [
              { text: "Option A", isCorrect: false },
              { text: "Option B", isCorrect: true },
              { text: "Option C", isCorrect: false },
            ],
          },
          {
            questionText: "New question?",
            options: [
              { text: "Option X", isCorrect: true },
              { text: "Option Y", isCorrect: false },
            ],
          },
        ],
        passingScore: 80,
      }, // Changed
      unitId, // Unchanged
      order: 3, // Unchanged
      createdBy,
      version: 2,
      updatedAt: contentChangeEvent.timestamp,
      createdAt: section.createdAt,
    });
  });

  test("Updating section order", () => {
    // First create a questionnaire section
    const sectionId = services.crypto.randomUUID();
    const unitId = services.crypto.randomUUID();
    const createdBy = services.crypto.randomUUID();

    const addEvent = QuestionnaireSectionAddedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: sectionId,
      payload: {
        title: "Quiz",
        content: {
          questions: [
            {
              questionText: "Sample question?",
              options: [
                { text: "Option A", isCorrect: true },
                { text: "Option B", isCorrect: false },
              ],
            },
          ],
          passingScore: 70,
        },
        unitId,
        order: 3,
        createdBy,
      },
      version: 1,
    });

    const section =
      QuestionnaireSectionProjector.project(addEvent).unwrapOrThrow();
    if (!section) throw new Error("Section was not created");

    // Then update the order
    const orderChangeEvent = SectionOrderChangedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: sectionId,
      payload: {
        order: 6,
        updatedBy: services.crypto.randomUUID(),
      },
      version: 2,
    });

    const updatedSection = QuestionnaireSectionProjector.project(
      orderChangeEvent,
      section,
    ).unwrapOrThrow();

    expect(updatedSection).toEqual({
      id: sectionId,
      title: "Quiz", // Unchanged
      content: section.content, // Unchanged
      unitId, // Unchanged
      order: 6, // Changed
      createdBy,
      version: 2,
      updatedAt: orderChangeEvent.timestamp,
      createdAt: section.createdAt,
    });
  });
});
