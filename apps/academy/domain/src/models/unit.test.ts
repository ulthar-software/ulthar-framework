import { beforeEach, describe, expect, test } from "@fabric/testing";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../services/mocks/create-mock-services.js";
import {
  UnitAddedEvent,
  UnitNameChangedEvent,
  UnitOrderChangedEvent,
  UnitProjector,
} from "./unit.js";

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
        title: "Unit 1",
        moduleId: services.crypto.randomUUID(),
        order: 1,
        createdBy: services.crypto.randomUUID(),
      },
      version: 1,
    });

    const unit = UnitProjector.project(event).unwrapOrThrow();

    expect(unit).toEqual({
      id: unitId,
      title: "Unit 1",
      moduleId: event.payload.moduleId,
      order: 1,
      createdBy: event.payload.createdBy,
      version: 1,
      updatedAt: event.timestamp,
      createdAt: event.timestamp,
    });
  });

  test("Changing a unit title", () => {
    // First create a unit
    const unitId = services.crypto.randomUUID();
    const addEvent: UnitAddedEvent = UnitAddedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: unitId,
      payload: {
        title: "Unit 1",
        moduleId: services.crypto.randomUUID(),
        order: 1,
        createdBy: services.crypto.randomUUID(),
      },
      version: 1,
    });

    const unit = UnitProjector.project(addEvent).unwrapOrThrow();

    if (!unit) throw new Error("Unit was not created");

    // Then update the unit title
    const titleChangedEvent: UnitNameChangedEvent = UnitNameChangedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: unitId,
      payload: {
        title: "Updated Unit Name",
        updatedBy: services.crypto.randomUUID(),
      },
      version: 2,
    });

    const updatedUnit = UnitProjector.project(
      titleChangedEvent,
      unit,
    ).unwrapOrThrow();

    expect(updatedUnit).toEqual({
      id: unitId,
      title: "Updated Unit Name",
      moduleId: unit.moduleId,
      order: unit.order,
      createdBy: unit.createdBy,
      version: 2,
      updatedAt: titleChangedEvent.timestamp,
      createdAt: unit.createdAt,
    });
  });

  test("Changing a unit order", () => {
    // First create a unit
    const unitId = services.crypto.randomUUID();
    const addEvent: UnitAddedEvent = UnitAddedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: unitId,
      payload: {
        title: "Unit 1",
        moduleId: services.crypto.randomUUID(),
        order: 1,
        createdBy: services.crypto.randomUUID(),
      },
      version: 1,
    });

    const unit = UnitProjector.project(addEvent).unwrapOrThrow();

    if (!unit) throw new Error("Unit was not created");

    // Then update the unit order
    const orderChangedEvent: UnitOrderChangedEvent = UnitOrderChangedEvent.from(
      {
        id: services.crypto.randomUUID(),
        streamId: unitId,
        payload: {
          order: 2,
          updatedBy: services.crypto.randomUUID(),
        },
        version: 2,
      },
    );

    const updatedUnit = UnitProjector.project(
      orderChangedEvent,
      unit,
    ).unwrapOrThrow();

    expect(updatedUnit).toEqual({
      id: unitId,
      title: unit.title,
      moduleId: unit.moduleId,
      order: 2,
      createdBy: unit.createdBy,
      version: 2,
      updatedAt: orderChangedEvent.timestamp,
      createdAt: unit.createdAt,
    });
  });
});
