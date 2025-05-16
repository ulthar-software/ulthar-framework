import { beforeEach, describe, expect, test } from "@fabric/testing";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../services/mocks/create-mock-services.js";
import type { Resource } from "./resource.js";
import {
  ResourceCreatedEvent,
  ResourceEditedEvent,
  ResourceProjector,
  ResourceType,
} from "./resource.js";

describe("Resource", () => {
  let services: MockedDependencies;

  beforeEach(async () => {
    services = await createServiceMocks();
  });

  test("Creating a Resource", () => {
    const resourceId = services.crypto.randomUUID();
    const event: ResourceCreatedEvent = ResourceCreatedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: resourceId,
      payload: {
        courseId: services.crypto.randomUUID(),
        title: "Clean Code",
        description: "A handbook of agile software craftsmanship",
        url: "https://example.com/clean-code",
        type: ResourceType.REQUIRED_READING,
        createdBy: services.crypto.randomUUID(),
      },
      version: 1,
    });

    const reference = ResourceProjector.project(event).unwrapOrThrow();

    expect(reference).toEqual({
      id: resourceId,
      courseId: event.payload.courseId,
      title: "Clean Code",
      description: "A handbook of agile software craftsmanship",
      url: "https://example.com/clean-code",
      type: ResourceType.REQUIRED_READING,
      createdBy: event.payload.createdBy,
      version: 1,
      updatedAt: event.timestamp,
      createdAt: event.timestamp,
    });
  });

  test("Editing a resource", () => {
    const resourceId = services.crypto.randomUUID();
    const event: ResourceCreatedEvent = ResourceCreatedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: resourceId,
      payload: {
        courseId: services.crypto.randomUUID(),
        title: "Clean Code",
        description: "A handbook of agile software craftsmanship",
        url: "https://example.com/clean-code",
        type: ResourceType.REQUIRED_READING,
        createdBy: services.crypto.randomUUID(),
      },
      version: 1,
    });

    const initialResource = ResourceProjector.project(event).unwrapOrThrow();

    const editedEvent = ResourceEditedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: resourceId,
      payload: {
        title: "Clean Code - Updated Edition",
        description: "A handbook of agile software craftsmanship",
        url: "https://example.com/clean-code",
        updatedBy: services.crypto.randomUUID(),
      },
      version: 2,
    });

    const editedResource = ResourceProjector.project(
      editedEvent,
      initialResource as Resource,
    ).unwrapOrThrow();

    expect(editedResource).toEqual({
      id: resourceId,
      courseId: event.payload.courseId,
      title: "Clean Code - Updated Edition",
      description: "A handbook of agile software craftsmanship",
      url: "https://example.com/clean-code",
      type: ResourceType.REQUIRED_READING,
      createdBy: event.payload.createdBy,
      version: 2,
      updatedAt: editedEvent.timestamp,
      createdAt: event.timestamp,
    });
  });
});
