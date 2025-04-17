import { beforeEach, describe, expect, test } from "@fabric/testing";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../../services/mocks/create-mock-services.js";
import {
  QuestionnaireSectionAddedEvent,
  QuestionnaireSectionProjector,
  SectionOrderChangedEvent,
  SectionTitleChangedEvent,
  TextSectionAddedEvent,
  TextSectionContentChangedEvent,
  TextSectionProjector,
  VideoSectionAddedEvent,
  VideoSectionContentChangedEvent,
  VideoSectionProjector,
} from "./section.js";

describe("Specialized Sections", () => {
  let services: MockedDependencies;

  beforeEach(async () => {
    services = await createServiceMocks();
  });

  test("Creating a TextSection", () => {
    const sectionId = services.crypto.randomUUID();
    const unitId = services.crypto.randomUUID();
    const createdBy = services.crypto.randomUUID();

    const event = TextSectionAddedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: sectionId,
      payload: {
        title: "Introduction",
        content: {
          text: "This is an introductory text section with detailed content.",
        },
        unitId,
        order: 1,
        createdBy,
      },
      version: 1n,
    });

    const section = TextSectionProjector.project(event).unwrapOrThrow();

    expect(section).toEqual({
      id: sectionId,
      title: "Introduction",
      content: {
        text: "This is an introductory text section with detailed content.",
      },
      unitId,
      order: 1,
      createdBy,
      version: 1n,
      updatedAt: event.timestamp,
      createdAt: event.timestamp,
    });
  });

  test("Creating a VideoSection", () => {
    const sectionId = services.crypto.randomUUID();
    const unitId = services.crypto.randomUUID();
    const createdBy = services.crypto.randomUUID();

    const event = VideoSectionAddedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: sectionId,
      payload: {
        title: "Video Tutorial",
        content: {
          videoUrl: "https://example.com/intro-video",
          description: "An introductory video about the course",
          duration: 360, // in seconds
        },
        unitId,
        order: 2,
        createdBy,
      },
      version: 1n,
    });

    const section = VideoSectionProjector.project(event).unwrapOrThrow();

    expect(section).toEqual({
      id: sectionId,
      title: "Video Tutorial",
      content: {
        videoUrl: "https://example.com/intro-video",
        description: "An introductory video about the course",
        duration: 360,
      },
      unitId,
      order: 2,
      createdBy,
      version: 1n,
      updatedAt: event.timestamp,
      createdAt: event.timestamp,
    });
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
      version: 1n,
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
      version: 1n,
      updatedAt: event.timestamp,
      createdAt: event.timestamp,
    });
  });

  test("Updating a TextSection content", () => {
    // First create a text section
    const sectionId = services.crypto.randomUUID();
    const unitId = services.crypto.randomUUID();
    const createdBy = services.crypto.randomUUID();

    const addEvent = TextSectionAddedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: sectionId,
      payload: {
        title: "Introduction",
        content: {
          text: "This is an introductory text section.",
        },
        unitId,
        order: 1,
        createdBy,
      },
      version: 1n,
    });

    const section = TextSectionProjector.project(addEvent).unwrapOrThrow();
    if (!section) throw new Error("Section was not created");

    // Then update the content
    const contentChangeEvent = TextSectionContentChangedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: sectionId,
      payload: {
        content: {
          text: "This is a revised and expanded introduction with more details.",
        },
        updatedBy: services.crypto.randomUUID(),
      },
      version: 2n,
    });

    const updatedSection = TextSectionProjector.project(
      contentChangeEvent,
      section,
    ).unwrapOrThrow();

    expect(updatedSection).toEqual({
      id: sectionId,
      title: "Introduction", // Unchanged
      content: {
        text: "This is a revised and expanded introduction with more details.", // Changed
      },
      unitId, // Unchanged
      order: 1, // Unchanged
      createdBy,
      version: 2n,
      updatedAt: contentChangeEvent.timestamp,
      createdAt: section.createdAt,
    });
  });

  test("Updating a VideoSection content", () => {
    // First create a video section
    const sectionId = services.crypto.randomUUID();
    const unitId = services.crypto.randomUUID();
    const createdBy = services.crypto.randomUUID();

    const addEvent = VideoSectionAddedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: sectionId,
      payload: {
        title: "Video Tutorial",
        content: {
          videoUrl: "https://example.com/old-video",
          description: "Old description",
          duration: 300,
        },
        unitId,
        order: 2,
        createdBy,
      },
      version: 1n,
    });

    const section = VideoSectionProjector.project(addEvent).unwrapOrThrow();
    if (!section) throw new Error("Section was not created");

    // Then update the content
    const contentChangeEvent = VideoSectionContentChangedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: sectionId,
      payload: {
        content: {
          videoUrl: "https://example.com/new-video",
          description: "Updated description with more details",
          duration: 450,
        },
        updatedBy: services.crypto.randomUUID(),
      },
      version: 2n,
    });

    const updatedSection = VideoSectionProjector.project(
      contentChangeEvent,
      section,
    ).unwrapOrThrow();

    expect(updatedSection).toEqual({
      id: sectionId,
      title: "Video Tutorial", // Unchanged
      content: {
        videoUrl: "https://example.com/new-video", // Changed
        description: "Updated description with more details", // Changed
        duration: 450, // Changed
      },
      unitId, // Unchanged
      order: 2, // Unchanged
      createdBy,
      version: 2n,
      updatedAt: contentChangeEvent.timestamp,
      createdAt: section.createdAt,
    });
  });

  test("Updating section title works on all section types", () => {
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
      version: 1n,
    });

    const section =
      QuestionnaireSectionProjector.project(addEvent).unwrapOrThrow();
    if (!section) throw new Error("Section was not created");

    // Then update only the title
    const titleChangeEvent = SectionTitleChangedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: sectionId,
      payload: {
        title: "Final Assessment",
        updatedBy: services.crypto.randomUUID(),
      },
      version: 2n,
    });

    const updatedSection = QuestionnaireSectionProjector.project(
      titleChangeEvent,
      section,
    ).unwrapOrThrow();

    expect(updatedSection).toEqual({
      id: sectionId,
      title: "Final Assessment", // Changed
      content: section.content, // Unchanged
      unitId, // Unchanged
      order: 3, // Unchanged
      createdBy,
      version: 2n,
      updatedAt: titleChangeEvent.timestamp,
      createdAt: section.createdAt,
    });
  });

  test("Updating section order works on all section types", () => {
    // Create a text section
    const sectionId = services.crypto.randomUUID();
    const unitId = services.crypto.randomUUID();
    const createdBy = services.crypto.randomUUID();

    const addEvent = TextSectionAddedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: sectionId,
      payload: {
        title: "Introduction",
        content: {
          text: "This is an introductory text.",
        },
        unitId,
        order: 1,
        createdBy,
      },
      version: 1n,
    });

    const section = TextSectionProjector.project(addEvent).unwrapOrThrow();
    if (!section) throw new Error("Section was not created");

    // Then update the order
    const orderChangeEvent = SectionOrderChangedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: sectionId,
      payload: {
        order: 4,
        updatedBy: services.crypto.randomUUID(),
      },
      version: 2n,
    });

    const updatedSection = TextSectionProjector.project(
      orderChangeEvent,
      section,
    ).unwrapOrThrow();

    expect(updatedSection).toEqual({
      id: sectionId,
      title: "Introduction", // Unchanged
      content: section.content, // Unchanged
      unitId, // Unchanged
      order: 4, // Changed
      createdBy,
      version: 2n,
      updatedAt: orderChangeEvent.timestamp,
      createdAt: section.createdAt,
    });
  });
});
