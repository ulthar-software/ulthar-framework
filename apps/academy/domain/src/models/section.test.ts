import { beforeEach, describe, expect, test } from "@fabric/testing";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../services/mocks/create-mock-services.js";
import {
  SectionAddedEvent,
  SectionContentChangedEvent,
  SectionOrderChangedEvent,
  SectionProjector,
  SectionTitleChangedEvent,
  SectionType,
  SectionTypeChangedEvent,
} from "./section.js";

describe("Section", () => {
  let services: MockedDependencies;

  beforeEach(async () => {
    services = await createServiceMocks();
  });

  test("Adding a section", () => {
    const sectionId = services.crypto.randomUUID();
    const event: SectionAddedEvent = SectionAddedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: sectionId,
      payload: {
        title: "Introduction",
        type: SectionType.TEXT,
        content: "This is an introductory section",
        unitId: services.crypto.randomUUID(),
        order: 1,
        createdBy: services.crypto.randomUUID(),
      },
      version: 1n,
    });

    const section = SectionProjector.project(event).unwrapOrThrow();

    expect(section).toEqual({
      id: sectionId,
      title: "Introduction",
      type: SectionType.TEXT,
      content: "This is an introductory section",
      unitId: event.payload.unitId,
      order: 1,
      createdBy: event.payload.createdBy,
      version: 1n,
      updatedAt: event.timestamp,
      createdAt: event.timestamp,
    });
  });

  test("Updating a section title", () => {
    // First create a section
    const sectionId = services.crypto.randomUUID();
    const addEvent: SectionAddedEvent = SectionAddedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: sectionId,
      payload: {
        title: "Introduction",
        type: SectionType.TEXT,
        content: "This is an introductory section",
        unitId: services.crypto.randomUUID(),
        order: 1,
        createdBy: services.crypto.randomUUID(),
      },
      version: 1n,
    });

    const section = SectionProjector.project(addEvent).unwrapOrThrow();
    if (!section) throw new Error("Section not projected");

    // Then update only the section title
    const titleChangeEvent: SectionTitleChangedEvent =
      SectionTitleChangedEvent.from({
        id: services.crypto.randomUUID(),
        streamId: sectionId,
        payload: {
          title: "Updated Introduction",
          updatedBy: services.crypto.randomUUID(),
        },
        version: 2n,
      });

    const updatedSection = SectionProjector.project(
      titleChangeEvent,
      section,
    ).unwrapOrThrow();

    expect(updatedSection).toEqual({
      id: sectionId,
      title: "Updated Introduction", // Changed
      type: SectionType.TEXT, // Unchanged
      content: "This is an introductory section", // Unchanged
      unitId: section.unitId, // Unchanged
      order: 1, // Unchanged
      createdBy: section.createdBy,
      version: 2n,
      updatedAt: titleChangeEvent.timestamp,
      createdAt: section.createdAt,
    });
  });

  test("Updating a section type", () => {
    // First create a section
    const sectionId = services.crypto.randomUUID();
    const addEvent: SectionAddedEvent = SectionAddedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: sectionId,
      payload: {
        title: "Introduction",
        type: SectionType.TEXT,
        content: "This is an introductory section",
        unitId: services.crypto.randomUUID(),
        order: 1,
        createdBy: services.crypto.randomUUID(),
      },
      version: 1n,
    });

    const section = SectionProjector.project(addEvent).unwrapOrThrow();
    if (!section) throw new Error("Section not projected");

    // Then update the section type and content
    const typeChangeEvent: SectionTypeChangedEvent =
      SectionTypeChangedEvent.from({
        id: services.crypto.randomUUID(),
        streamId: sectionId,
        payload: {
          type: SectionType.VIDEO,
          content: "https://example.com/intro-video",
          updatedBy: services.crypto.randomUUID(),
        },
        version: 2n,
      });

    const updatedSection = SectionProjector.project(
      typeChangeEvent,
      section,
    ).unwrapOrThrow();

    expect(updatedSection).toEqual({
      id: sectionId,
      title: "Introduction", // Unchanged
      type: SectionType.VIDEO, // Changed
      content: "https://example.com/intro-video", // Changed
      unitId: section.unitId, // Unchanged
      order: 1, // Unchanged
      createdBy: section.createdBy,
      version: 2n,
      updatedAt: typeChangeEvent.timestamp,
      createdAt: section.createdAt,
    });
  });

  test("Updating section content only", () => {
    // First create a section
    const sectionId = services.crypto.randomUUID();
    const addEvent: SectionAddedEvent = SectionAddedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: sectionId,
      payload: {
        title: "Introduction",
        type: SectionType.TEXT,
        content: "This is an introductory section",
        unitId: services.crypto.randomUUID(),
        order: 1,
        createdBy: services.crypto.randomUUID(),
      },
      version: 1n,
    });

    const section = SectionProjector.project(addEvent).unwrapOrThrow();
    if (!section) throw new Error("Section not projected");

    // Then update only the content
    const contentChangeEvent: SectionContentChangedEvent =
      SectionContentChangedEvent.from({
        id: services.crypto.randomUUID(),
        streamId: sectionId,
        payload: {
          content: "This is a revised introductory section with more details",
          updatedBy: services.crypto.randomUUID(),
        },
        version: 2n,
      });

    const updatedSection = SectionProjector.project(
      contentChangeEvent,
      section,
    ).unwrapOrThrow();

    expect(updatedSection).toEqual({
      id: sectionId,
      title: "Introduction", // Unchanged
      type: SectionType.TEXT, // Unchanged
      content: "This is a revised introductory section with more details", // Changed
      unitId: section.unitId, // Unchanged
      order: 1, // Unchanged
      createdBy: section.createdBy,
      version: 2n,
      updatedAt: contentChangeEvent.timestamp,
      createdAt: section.createdAt,
    });
  });

  test("Updating section order", () => {
    // First create a section
    const sectionId = services.crypto.randomUUID();
    const addEvent: SectionAddedEvent = SectionAddedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: sectionId,
      payload: {
        title: "Introduction",
        type: SectionType.TEXT,
        content: "This is an introductory section",
        unitId: services.crypto.randomUUID(),
        order: 1,
        createdBy: services.crypto.randomUUID(),
      },
      version: 1n,
    });

    const section = SectionProjector.project(addEvent).unwrapOrThrow();
    if (!section) throw new Error("Section not projected");

    // Then update only the order
    const orderChangeEvent: SectionOrderChangedEvent =
      SectionOrderChangedEvent.from({
        id: services.crypto.randomUUID(),
        streamId: sectionId,
        payload: {
          order: 3,
          updatedBy: services.crypto.randomUUID(),
        },
        version: 2n,
      });

    const updatedSection = SectionProjector.project(
      orderChangeEvent,
      section,
    ).unwrapOrThrow();

    expect(updatedSection).toEqual({
      id: sectionId,
      title: "Introduction", // Unchanged
      type: SectionType.TEXT, // Unchanged
      content: "This is an introductory section", // Unchanged
      unitId: section.unitId, // Unchanged
      order: 3, // Changed
      createdBy: section.createdBy,
      version: 2n,
      updatedAt: orderChangeEvent.timestamp,
      createdAt: section.createdAt,
    });
  });
});
