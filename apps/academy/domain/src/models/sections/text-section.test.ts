import { beforeEach, describe, expect, test } from "@fabric/testing";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../../services/mocks/create-mock-services.js";
import {
  SectionOrderChangedEvent,
  SectionTitleChangedEvent,
} from "./section-base.js";
import {
  TextSectionAddedEvent,
  TextSectionContentChangedEvent,
  TextSectionProjector,
} from "./text-section.js";

describe("Text Section", () => {
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
      version: 1,
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
      version: 1,
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
      version: 1,
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
      version: 2,
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
      version: 2,
      updatedAt: contentChangeEvent.timestamp,
      createdAt: section.createdAt,
    });
  });

  test("Updating section title", () => {
    // First create a text section
    const sectionId = services.crypto.randomUUID();
    const unitId = services.crypto.randomUUID();
    const createdBy = services.crypto.randomUUID();

    const addEvent = TextSectionAddedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: sectionId,
      payload: {
        title: "Old Title",
        content: {
          text: "This is a text section.",
        },
        unitId,
        order: 1,
        createdBy,
      },
      version: 1,
    });

    const section = TextSectionProjector.project(addEvent).unwrapOrThrow();
    if (!section) throw new Error("Section was not created");

    // Then update the title
    const titleChangeEvent = SectionTitleChangedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: sectionId,
      payload: {
        title: "New Title",
        updatedBy: services.crypto.randomUUID(),
      },
      version: 2,
    });

    const updatedSection = TextSectionProjector.project(
      titleChangeEvent,
      section,
    ).unwrapOrThrow();

    expect(updatedSection).toEqual({
      id: sectionId,
      title: "New Title", // Changed
      content: section.content, // Unchanged
      unitId,
      order: 1,
      createdBy,
      version: 2,
      updatedAt: titleChangeEvent.timestamp,
      createdAt: section.createdAt,
    });
  });

  test("Updating section order", () => {
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
          text: "This is an introductory text.",
        },
        unitId,
        order: 1,
        createdBy,
      },
      version: 1,
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
      version: 2,
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
      version: 2,
      updatedAt: orderChangeEvent.timestamp,
      createdAt: section.createdAt,
    });
  });
});
