import { beforeEach, describe, expect, test } from "@fabric/testing";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../services/mocks/create-mock-services.js";
import {
  ResourceCreatedEvent,
  ResourceDescriptionChangedEvent,
  ResourceProjector,
  ResourceTitleChangedEvent,
  ResourceUrlChangedEvent,
} from "./resource.js";

describe("Resource", () => {
  let services: MockedDependencies;

  beforeEach(async () => {
    services = await createServiceMocks();
  });

  test("Creating a reference", () => {
    const referenceId = services.crypto.randomUUID();
    const event: ResourceCreatedEvent = ResourceCreatedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: referenceId,
      payload: {
        courseId: services.crypto.randomUUID(),
        title: "Clean Code",
        description: "A handbook of agile software craftsmanship",
        url: "https://example.com/clean-code",
        createdBy: services.crypto.randomUUID(),
      },
      version: 1,
    });

    const reference = ResourceProjector.project(event).unwrapOrThrow();

    expect(reference).toEqual({
      id: referenceId,
      courseId: event.payload.courseId,
      title: "Clean Code",
      description: "A handbook of agile software craftsmanship",
      url: "https://example.com/clean-code",
      createdBy: event.payload.createdBy,
      version: 1,
      updatedAt: event.timestamp,
      createdAt: event.timestamp,
    });
  });

  test("Changing a reference title", () => {
    // First create a reference
    const referenceId = services.crypto.randomUUID();
    const createEvent: ResourceCreatedEvent = ResourceCreatedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: referenceId,
      payload: {
        courseId: services.crypto.randomUUID(),
        title: "Clean Code",
        description: "A handbook of agile software craftsmanship",
        url: "https://example.com/clean-code",
        createdBy: services.crypto.randomUUID(),
      },
      version: 1,
    });

    const reference = ResourceProjector.project(createEvent).unwrapOrThrow();

    if (!reference) throw new Error("Resource was not created");

    // Then update the reference title
    const titleChangedEvent: ResourceTitleChangedEvent =
      ResourceTitleChangedEvent.from({
        id: services.crypto.randomUUID(),
        streamId: referenceId,
        payload: {
          title: "Clean Code: A Handbook of Agile Software Craftsmanship",
          updatedBy: services.crypto.randomUUID(),
        },
        version: 2,
      });

    const updatedResource = ResourceProjector.project(
      titleChangedEvent,
      reference,
    ).unwrapOrThrow();

    expect(updatedResource).toEqual({
      id: referenceId,
      courseId: reference.courseId,
      title: "Clean Code: A Handbook of Agile Software Craftsmanship",
      description: reference.description,
      url: reference.url,
      createdBy: reference.createdBy,
      version: 2,
      updatedAt: titleChangedEvent.timestamp,
      createdAt: reference.createdAt,
    });
  });

  test("Changing a reference description", () => {
    // First create a reference
    const referenceId = services.crypto.randomUUID();
    const createEvent: ResourceCreatedEvent = ResourceCreatedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: referenceId,
      payload: {
        courseId: services.crypto.randomUUID(),
        title: "Clean Code",
        description: "A handbook of agile software craftsmanship",
        url: "https://example.com/clean-code",
        createdBy: services.crypto.randomUUID(),
      },
      version: 1,
    });

    const reference = ResourceProjector.project(createEvent).unwrapOrThrow();

    if (!reference) throw new Error("Resource was not created");

    // Then update the reference description
    const descriptionChangedEvent: ResourceDescriptionChangedEvent =
      ResourceDescriptionChangedEvent.from({
        id: services.crypto.randomUUID(),
        streamId: referenceId,
        payload: {
          description:
            "The must-read book about writing clean, maintainable code",
          updatedBy: services.crypto.randomUUID(),
        },
        version: 2,
      });

    const updatedResource = ResourceProjector.project(
      descriptionChangedEvent,
      reference,
    ).unwrapOrThrow();

    expect(updatedResource).toEqual({
      id: referenceId,
      courseId: reference.courseId,
      title: reference.title,
      description: "The must-read book about writing clean, maintainable code",
      url: reference.url,
      createdBy: reference.createdBy,
      version: 2,
      updatedAt: descriptionChangedEvent.timestamp,
      createdAt: reference.createdAt,
    });
  });

  test("Changing a reference URL", () => {
    // First create a reference
    const referenceId = services.crypto.randomUUID();
    const createEvent: ResourceCreatedEvent = ResourceCreatedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: referenceId,
      payload: {
        courseId: services.crypto.randomUUID(),
        title: "Clean Code",
        description: "A handbook of agile software craftsmanship",
        url: "https://example.com/clean-code",
        createdBy: services.crypto.randomUUID(),
      },
      version: 1,
    });

    const reference = ResourceProjector.project(createEvent).unwrapOrThrow();

    if (!reference) throw new Error("Resource was not created");

    // Then update the reference URL
    const urlChangedEvent: ResourceUrlChangedEvent =
      ResourceUrlChangedEvent.from({
        id: services.crypto.randomUUID(),
        streamId: referenceId,
        payload: {
          url: "https://example.com/books/clean-code-2nd-edition",
          updatedBy: services.crypto.randomUUID(),
        },
        version: 2,
      });

    const updatedResource = ResourceProjector.project(
      urlChangedEvent,
      reference,
    ).unwrapOrThrow();

    expect(updatedResource).toEqual({
      id: referenceId,
      courseId: reference.courseId,
      title: reference.title,
      description: reference.description,
      url: "https://example.com/books/clean-code-2nd-edition",
      createdBy: reference.createdBy,
      version: 2,
      updatedAt: urlChangedEvent.timestamp,
      createdAt: reference.createdAt,
    });
  });
});
