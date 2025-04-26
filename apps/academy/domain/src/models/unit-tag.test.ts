import { beforeEach, describe, expect, test } from "@fabric/testing";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../services/mocks/create-mock-services.js";
import {
  UnitTagCreatedEvent,
  UnitTagProjector,
  UnitTagRemovedEvent,
} from "./unit-tag.js";

describe("UnitTag", () => {
  let services: MockedDependencies;

  beforeEach(async () => {
    services = await createServiceMocks();
  });

  test("Creating a unit-tag association", () => {
    const unitTagId = services.crypto.randomUUID();
    const unitId = services.crypto.randomUUID();
    const tagId = services.crypto.randomUUID();
    const userId = services.crypto.randomUUID();

    const event: UnitTagCreatedEvent = UnitTagCreatedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: unitTagId,
      payload: {
        unitId,
        tagId,
        createdBy: userId,
      },
      version: 1,
    });

    const unitTag = UnitTagProjector.project(event).unwrapOrThrow();

    expect(unitTag).toEqual({
      id: unitTagId,
      unitId,
      tagId,
      createdBy: userId,
      version: 1,
      updatedAt: event.timestamp,
      createdAt: event.timestamp,
    });
  });

  test("Removing a unit-tag association", () => {
    // First create a unit-tag association
    const unitTagId = services.crypto.randomUUID();
    const unitId = services.crypto.randomUUID();
    const tagId = services.crypto.randomUUID();
    const userId = services.crypto.randomUUID();

    const createEvent: UnitTagCreatedEvent = UnitTagCreatedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: unitTagId,
      payload: {
        unitId,
        tagId,
        createdBy: userId,
      },
      version: 1,
    });

    const unitTag = UnitTagProjector.project(createEvent).unwrapOrThrow();

    if (!unitTag) throw new Error("UnitTag was not created");

    const removeUserId = services.crypto.randomUUID();
    const removeEvent: UnitTagRemovedEvent = UnitTagRemovedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: unitTagId,
      payload: {
        removedBy: removeUserId,
      },
      version: 2,
    });

    const removedUnitTag = UnitTagProjector.project(
      removeEvent,
      unitTag,
    ).unwrapOrThrow();

    expect(removedUnitTag).toEqual(null);
  });
});
