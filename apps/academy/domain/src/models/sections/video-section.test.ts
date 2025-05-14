import { beforeEach, describe, expect, test } from "@fabric/testing";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../../services/mocks/create-mock-services.js";
import { SectionOrderChangedEvent } from "./section-base.js";
import {
  VideoSectionAddedEvent,
  VideoSectionContentChangedEvent,
  VideoSectionProjector,
} from "./video-section.js";

describe("Video Section", () => {
  let services: MockedDependencies;

  beforeEach(async () => {
    services = await createServiceMocks();
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
      version: 1,
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
      version: 1,
      updatedAt: event.timestamp,
      createdAt: event.timestamp,
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
      version: 1,
    });

    const section = VideoSectionProjector.project(addEvent).unwrapOrThrow();
    if (!section) throw new Error("Section was not created");

    // Then update the content
    const contentChangeEvent = VideoSectionContentChangedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: sectionId,
      payload: {
        title: "Video Tutorial", // Title remains unchanged
        content: {
          videoUrl: "https://example.com/new-video",
          description: "Updated description with more details",
          duration: 450,
        },
        updatedBy: services.crypto.randomUUID(),
      },
      version: 2,
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
      version: 2,
      updatedAt: contentChangeEvent.timestamp,
      createdAt: section.createdAt,
    });
  });

  test("Updating section order", () => {
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
          videoUrl: "https://example.com/video",
          description: "Some description",
          duration: 300,
        },
        unitId,
        order: 2,
        createdBy,
      },
      version: 1,
    });

    const section = VideoSectionProjector.project(addEvent).unwrapOrThrow();
    if (!section) throw new Error("Section was not created");

    // Then update the order
    const orderChangeEvent = SectionOrderChangedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: sectionId,
      payload: {
        order: 5,
        updatedBy: services.crypto.randomUUID(),
      },
      version: 2,
    });

    const updatedSection = VideoSectionProjector.project(
      orderChangeEvent,
      section,
    ).unwrapOrThrow();

    expect(updatedSection).toEqual({
      id: sectionId,
      title: "Video Tutorial", // Unchanged
      content: section.content, // Unchanged
      unitId, // Unchanged
      order: 5, // Changed
      createdBy,
      version: 2,
      updatedAt: orderChangeEvent.timestamp,
      createdAt: section.createdAt,
    });
  });
});
