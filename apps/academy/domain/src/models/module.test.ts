import { beforeEach, describe, expect, test } from "@fabric/testing";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../services/mocks/create-mock-services.js";
import {
  ModuleAddedEvent,
  ModuleProjector,
  ModuleUpdatedEvent,
} from "./module.js";

describe("Module", () => {
  let services: MockedDependencies;

  beforeEach(async () => {
    services = await createServiceMocks();
  });

  test("Adding a module", () => {
    const moduleId = services.crypto.randomUUID();
    const courseId = services.crypto.randomUUID();
    const createdBy = services.crypto.randomUUID();

    const event: ModuleAddedEvent = ModuleAddedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: moduleId,
      payload: {
        title: "Introduction to JavaScript",
        description: "Learn the fundamentals of JavaScript programming",
        courseId: courseId,
        order: 1,
        createdBy: createdBy,
      },
      version: 1n,
    });

    const module = ModuleProjector.project(event).unwrapOrThrow();

    expect(module).toEqual({
      id: moduleId,
      title: "Introduction to JavaScript",
      description: "Learn the fundamentals of JavaScript programming",
      courseId: courseId,
      order: 1,
      createdBy: createdBy,
      version: 1n,
      updatedAt: event.timestamp,
      createdAt: event.timestamp,
    });
  });

  test("Updating a module", () => {
    // First add a module
    const moduleId = services.crypto.randomUUID();
    const courseId = services.crypto.randomUUID();
    const createdBy = services.crypto.randomUUID();

    const addEvent: ModuleAddedEvent = ModuleAddedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: moduleId,
      payload: {
        title: "Introduction to JavaScript",
        description: "Learn the fundamentals of JavaScript programming",
        courseId: courseId,
        order: 1,
        createdBy: createdBy,
      },
      version: 1n,
    });

    const module = ModuleProjector.project(addEvent).unwrapOrThrow();

    if (!module) throw new Error("Module was not created");

    // Then update the module
    const updatedBy = services.crypto.randomUUID();
    const updateEvent: ModuleUpdatedEvent = ModuleUpdatedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: moduleId,
      payload: {
        title: "Advanced JavaScript Concepts",
        description: "Deep dive into advanced JavaScript features and patterns",
        order: 2,
        updatedBy: updatedBy,
      },
      version: 2n,
    });

    const updatedModule = ModuleProjector.project(
      updateEvent,
      module,
    ).unwrapOrThrow();

    expect(updatedModule).toEqual({
      id: moduleId,
      title: "Advanced JavaScript Concepts",
      description: "Deep dive into advanced JavaScript features and patterns",
      courseId: courseId,
      order: 2,
      createdBy: createdBy,
      version: 2n,
      updatedAt: updateEvent.timestamp,
      createdAt: module.createdAt,
    });
  });
});
