import { beforeEach, describe, expect, test } from "@fabric/testing";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../services/mocks/create-mock-services.js";
import {
  ResourceTagCreatedEvent,
  ResourceTagProjector,
  ResourceTagRemovedEvent,
} from "./resource-tag.js";

describe("ResourceTag", () => {
  let services: MockedDependencies;

  beforeEach(async () => {
    services = await createServiceMocks();
  });

  test("Creating a resource-tag association", () => {
    const resourceTagId = services.crypto.randomUUID();
    const resourceId = services.crypto.randomUUID();
    const tagId = services.crypto.randomUUID();
    const userId = services.crypto.randomUUID();

    const event: ResourceTagCreatedEvent = ResourceTagCreatedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: resourceTagId,
      payload: {
        resourceId,
        tagId,
        createdBy: userId,
      },
      version: 1,
    });

    const resourceTag = ResourceTagProjector.project(event).unwrapOrThrow();

    expect(resourceTag).toEqual({
      id: resourceTagId,
      resourceId,
      tagId,
      createdBy: userId,
      version: 1,
      updatedAt: event.timestamp,
      createdAt: event.timestamp,
    });
  });

  test("Removing a resource-tag association", () => {
    // First create a resource-tag association
    const resourceTagId = services.crypto.randomUUID();
    const resourceId = services.crypto.randomUUID();
    const tagId = services.crypto.randomUUID();
    const userId = services.crypto.randomUUID();

    const createEvent: ResourceTagCreatedEvent = ResourceTagCreatedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: resourceTagId,
      payload: {
        resourceId,
        tagId,
        createdBy: userId,
      },
      version: 1,
    });

    const resourceTag =
      ResourceTagProjector.project(createEvent).unwrapOrThrow();

    if (!resourceTag) throw new Error("ResourceTag was not created");

    const removeUserId = services.crypto.randomUUID();
    const removeEvent: ResourceTagRemovedEvent = ResourceTagRemovedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: resourceTagId,
      payload: {
        removedBy: removeUserId,
      },
      version: 2,
    });

    const removedResourceTag = ResourceTagProjector.project(
      removeEvent,
      resourceTag,
    ).unwrapOrThrow();

    expect(removedResourceTag).toEqual(null);
  });
});
