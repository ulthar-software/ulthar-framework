import { beforeEach, describe, expect, test } from "@fabric/testing";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../services/mocks/create-mock-services.js";
import {
  ReferenceCreatedEvent,
  ReferenceDescriptionChangedEvent,
  ReferenceProjector,
  ReferenceTitleChangedEvent,
  ReferenceUrlChangedEvent,
} from "./reference.js";

describe("Reference", () => {
  let services: MockedDependencies;

  beforeEach(async () => {
    services = await createServiceMocks();
  });

  test("Creating a reference", () => {
    const referenceId = services.crypto.randomUUID();
    const event: ReferenceCreatedEvent = ReferenceCreatedEvent.from({
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

    const reference = ReferenceProjector.project(event).unwrapOrThrow();

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
    const createEvent: ReferenceCreatedEvent = ReferenceCreatedEvent.from({
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

    const reference = ReferenceProjector.project(createEvent).unwrapOrThrow();

    if (!reference) throw new Error("Reference was not created");

    // Then update the reference title
    const titleChangedEvent: ReferenceTitleChangedEvent =
      ReferenceTitleChangedEvent.from({
        id: services.crypto.randomUUID(),
        streamId: referenceId,
        payload: {
          title: "Clean Code: A Handbook of Agile Software Craftsmanship",
          updatedBy: services.crypto.randomUUID(),
        },
        version: 2,
      });

    const updatedReference = ReferenceProjector.project(
      titleChangedEvent,
      reference,
    ).unwrapOrThrow();

    expect(updatedReference).toEqual({
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
    const createEvent: ReferenceCreatedEvent = ReferenceCreatedEvent.from({
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

    const reference = ReferenceProjector.project(createEvent).unwrapOrThrow();

    if (!reference) throw new Error("Reference was not created");

    // Then update the reference description
    const descriptionChangedEvent: ReferenceDescriptionChangedEvent =
      ReferenceDescriptionChangedEvent.from({
        id: services.crypto.randomUUID(),
        streamId: referenceId,
        payload: {
          description:
            "The must-read book about writing clean, maintainable code",
          updatedBy: services.crypto.randomUUID(),
        },
        version: 2,
      });

    const updatedReference = ReferenceProjector.project(
      descriptionChangedEvent,
      reference,
    ).unwrapOrThrow();

    expect(updatedReference).toEqual({
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
    const createEvent: ReferenceCreatedEvent = ReferenceCreatedEvent.from({
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

    const reference = ReferenceProjector.project(createEvent).unwrapOrThrow();

    if (!reference) throw new Error("Reference was not created");

    // Then update the reference URL
    const urlChangedEvent: ReferenceUrlChangedEvent =
      ReferenceUrlChangedEvent.from({
        id: services.crypto.randomUUID(),
        streamId: referenceId,
        payload: {
          url: "https://example.com/books/clean-code-2nd-edition",
          updatedBy: services.crypto.randomUUID(),
        },
        version: 2,
      });

    const updatedReference = ReferenceProjector.project(
      urlChangedEvent,
      reference,
    ).unwrapOrThrow();

    expect(updatedReference).toEqual({
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
