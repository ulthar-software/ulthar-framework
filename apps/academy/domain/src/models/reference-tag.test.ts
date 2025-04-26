import { beforeEach, describe, expect, test } from "@fabric/testing";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../services/mocks/create-mock-services.js";
import {
  ReferenceTagCreatedEvent,
  ReferenceTagProjector,
  ReferenceTagRemovedEvent,
} from "./reference-tag.js";

describe("ReferenceTag", () => {
  let services: MockedDependencies;

  beforeEach(async () => {
    services = await createServiceMocks();
  });

  test("Creating a reference-tag association", () => {
    const referenceTagId = services.crypto.randomUUID();
    const referenceId = services.crypto.randomUUID();
    const tagId = services.crypto.randomUUID();
    const userId = services.crypto.randomUUID();

    const event: ReferenceTagCreatedEvent = ReferenceTagCreatedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: referenceTagId,
      payload: {
        referenceId,
        tagId,
        createdBy: userId,
      },
      version: 1,
    });

    const referenceTag = ReferenceTagProjector.project(event).unwrapOrThrow();

    expect(referenceTag).toEqual({
      id: referenceTagId,
      referenceId,
      tagId,
      createdBy: userId,
      version: 1,
      updatedAt: event.timestamp,
      createdAt: event.timestamp,
    });
  });

  test("Removing a reference-tag association", () => {
    // First create a reference-tag association
    const referenceTagId = services.crypto.randomUUID();
    const referenceId = services.crypto.randomUUID();
    const tagId = services.crypto.randomUUID();
    const userId = services.crypto.randomUUID();

    const createEvent: ReferenceTagCreatedEvent = ReferenceTagCreatedEvent.from(
      {
        id: services.crypto.randomUUID(),
        streamId: referenceTagId,
        payload: {
          referenceId,
          tagId,
          createdBy: userId,
        },
        version: 1,
      },
    );

    const referenceTag =
      ReferenceTagProjector.project(createEvent).unwrapOrThrow();

    if (!referenceTag) throw new Error("ReferenceTag was not created");

    const removeUserId = services.crypto.randomUUID();
    const removeEvent: ReferenceTagRemovedEvent = ReferenceTagRemovedEvent.from(
      {
        id: services.crypto.randomUUID(),
        streamId: referenceTagId,
        payload: {
          removedBy: removeUserId,
        },
        version: 2,
      },
    );

    const removedReferenceTag = ReferenceTagProjector.project(
      removeEvent,
      referenceTag,
    ).unwrapOrThrow();

    expect(removedReferenceTag).toEqual(null);
  });
});
