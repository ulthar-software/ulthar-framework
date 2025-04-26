import { beforeEach, describe, expect, test } from "@fabric/testing";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../services/mocks/create-mock-services.js";
import { TagCreatedEvent, TagNameChangedEvent, TagProjector } from "./tag.js";

describe("Tag", () => {
  let services: MockedDependencies;

  beforeEach(async () => {
    services = await createServiceMocks();
  });

  test("Creating a tag", () => {
    const tagId = services.crypto.randomUUID();
    const event: TagCreatedEvent = TagCreatedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: tagId,
      payload: {
        name: "JavaScript",
        createdBy: services.crypto.randomUUID(),
      },
      version: 1,
    });

    const tag = TagProjector.project(event).unwrapOrThrow();

    expect(tag).toEqual({
      id: tagId,
      name: "JavaScript",
      createdBy: event.payload.createdBy,
      version: 1,
      updatedAt: event.timestamp,
      createdAt: event.timestamp,
    });
  });

  test("Changing a tag name", () => {
    // First create a tag
    const tagId = services.crypto.randomUUID();
    const createEvent: TagCreatedEvent = TagCreatedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: tagId,
      payload: {
        name: "JavaScript",
        createdBy: services.crypto.randomUUID(),
      },
      version: 1,
    });

    const tag = TagProjector.project(createEvent).unwrapOrThrow();

    if (!tag) throw new Error("Tag was not created");

    // Then update the tag name
    const nameChangedEvent: TagNameChangedEvent = TagNameChangedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: tagId,
      payload: {
        name: "TypeScript",
        updatedBy: services.crypto.randomUUID(),
      },
      version: 2,
    });

    const updatedTag = TagProjector.project(
      nameChangedEvent,
      tag,
    ).unwrapOrThrow();

    expect(updatedTag).toEqual({
      id: tagId,
      name: "TypeScript",
      createdBy: tag.createdBy,
      version: 2,
      updatedAt: nameChangedEvent.timestamp,
      createdAt: tag.createdAt,
    });
  });
});
