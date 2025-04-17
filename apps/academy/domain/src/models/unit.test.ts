import { beforeEach, describe, expect, test } from "@fabric/testing";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../services/mocks/create-mock-services.js";
import { UnitAddedEvent, UnitProjector, UnitUpdatedEvent } from "./unit.js";

describe("Unit", () => {
  let services: MockedDependencies;

  beforeEach(async () => {
    services = await createServiceMocks();
  });

  test("Adding a unit", () => {
    const unitId = services.crypto.randomUUID();
    const event: UnitAddedEvent = UnitAddedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: unitId,
      payload: {
        name: "Unit 1",
        moduleId: services.crypto.randomUUID(),
        order: 1,
        createdBy: services.crypto.randomUUID(),
      },
      version: 1n,
    });

    const unit = UnitProjector.project(event).unwrapOrThrow();

    expect(unit).toEqual({
      id: unitId,
      name: "Unit 1",
      moduleId: event.payload.moduleId,
      order: 1,
      createdBy: event.payload.createdBy,
      version: 1n,
      updatedAt: event.timestamp,
      createdAt: event.timestamp,
    });
  });

  test("Updating a unit", () => {
    // First create a unit
    const unitId = services.crypto.randomUUID();
    const addEvent: UnitAddedEvent = UnitAddedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: unitId,
      payload: {
        name: "Unit 1",
        moduleId: services.crypto.randomUUID(),
        order: 1,
        createdBy: services.crypto.randomUUID(),
      },
      version: 1n,
    });

    const unit = UnitProjector.project(addEvent).unwrapOrThrow();

    if (!unit) throw new Error("Unit was not created");

    // Then update the unit
    const updateEvent: UnitUpdatedEvent = UnitUpdatedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: unitId,
      payload: {
        name: "Updated Unit Name",
        order: 2,
        updatedBy: services.crypto.randomUUID(),
      },
      version: 2n,
    });

    const updatedUnit = UnitProjector.project(
      updateEvent,
      unit,
    ).unwrapOrThrow();

    expect(updatedUnit).toEqual({
      id: unitId,
      name: "Updated Unit Name",
      moduleId: unit.moduleId,
      order: 2,
      createdBy: unit.createdBy,
      version: 2n,
      updatedAt: updateEvent.timestamp,
      createdAt: unit.createdAt,
    });
  });
});
