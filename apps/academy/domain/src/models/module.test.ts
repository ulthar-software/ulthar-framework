import { beforeEach, describe, expect, test } from "@fabric/testing";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../services/mocks/create-mock-services.js";
import {
  ModuleAddedEvent,
  ModuleDescriptionChangedEvent,
  ModuleOrderChangedEvent,
  ModuleProjector,
  ModuleTitleChangedEvent,
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
      version: 1,
    });

    const module = ModuleProjector.project(event).unwrapOrThrow();

    expect(module).toEqual({
      id: moduleId,
      title: "Introduction to JavaScript",
      description: "Learn the fundamentals of JavaScript programming",
      courseId: courseId,
      order: 1,
      createdBy: createdBy,
      version: 1,
      updatedAt: event.timestamp,
      createdAt: event.timestamp,
    });
  });

  test("Updating a module title", () => {
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
      version: 1,
    });

    const module = ModuleProjector.project(addEvent).unwrapOrThrow();

    if (!module) throw new Error("Module was not created");

    // Then update the module title
    const updatedBy = services.crypto.randomUUID();
    const titleEvent = ModuleTitleChangedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: moduleId,
      payload: {
        title: "Advanced JavaScript Concepts",
        updatedBy,
      },
      version: 2,
    });

    const titleUpdatedModule = ModuleProjector.project(
      titleEvent,
      module,
    ).unwrapOrThrow();

    expect(titleUpdatedModule).toEqual({
      id: moduleId,
      title: "Advanced JavaScript Concepts",
      description: "Learn the fundamentals of JavaScript programming",
      courseId: courseId,
      order: 1,
      createdBy: createdBy,
      version: 2,
      updatedAt: titleEvent.timestamp,
      createdAt: module.createdAt,
    });
  });

  test("Updating module description", () => {
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
      version: 1,
    });

    const module = ModuleProjector.project(addEvent).unwrapOrThrow();
    if (!module) throw new Error("Module was not created");

    const updatedBy = services.crypto.randomUUID();
    const descriptionEvent = ModuleDescriptionChangedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: moduleId,
      payload: {
        description: "Deep dive into advanced JavaScript features and patterns",
        updatedBy,
      },
      version: 2,
    });

    const descriptionUpdatedModule = ModuleProjector.project(
      descriptionEvent,
      module,
    ).unwrapOrThrow();

    expect(descriptionUpdatedModule).toEqual({
      id: moduleId,
      title: "Introduction to JavaScript",
      description: "Deep dive into advanced JavaScript features and patterns",
      courseId: courseId,
      order: 1,
      createdBy: createdBy,
      version: 2,
      updatedAt: descriptionEvent.timestamp,
      createdAt: module.createdAt,
    });
  });

  test("Updating module order", () => {
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
      version: 1,
    });

    const module = ModuleProjector.project(addEvent).unwrapOrThrow();
    if (!module) throw new Error("Module was not created");

    const updatedBy = services.crypto.randomUUID();
    const orderEvent = ModuleOrderChangedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: moduleId,
      payload: {
        order: 2,
        updatedBy,
      },
      version: 2,
    });

    const orderUpdatedModule = ModuleProjector.project(
      orderEvent,
      module,
    ).unwrapOrThrow();

    expect(orderUpdatedModule).toEqual({
      id: moduleId,
      title: "Introduction to JavaScript",
      description: "Learn the fundamentals of JavaScript programming",
      courseId: courseId,
      order: 2,
      createdBy: createdBy,
      version: 2,
      updatedAt: orderEvent.timestamp,
      createdAt: module.createdAt,
    });
  });

  test("Applying multiple update events sequentially", () => {
    // First add a module
    const moduleId = services.crypto.randomUUID();
    const courseId = services.crypto.randomUUID();
    const createdBy = services.crypto.randomUUID();
    const updatedBy = services.crypto.randomUUID();

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
      version: 1,
    });

    // Create initial module
    const moduleState = ModuleProjector.project(addEvent).unwrapOrThrow();
    if (!moduleState) throw new Error("Module was not created");

    // Update the title
    const titleEvent = ModuleTitleChangedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: moduleId,
      payload: {
        title: "Advanced JavaScript Concepts",
        updatedBy,
      },
      version: 2,
    });

    const afterTitleUpdate = ModuleProjector.project(
      titleEvent,
      moduleState,
    ).unwrapOrThrow();
    if (!afterTitleUpdate) throw new Error("Title update failed");

    // Update the description
    const descriptionEvent = ModuleDescriptionChangedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: moduleId,
      payload: {
        description: "Deep dive into advanced JavaScript features and patterns",
        updatedBy,
      },
      version: 3n,
    });

    const afterDescUpdate = ModuleProjector.project(
      descriptionEvent,
      afterTitleUpdate,
    ).unwrapOrThrow();
    if (!afterDescUpdate) throw new Error("Description update failed");

    // Update the order
    const orderEvent = ModuleOrderChangedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: moduleId,
      payload: {
        order: 2,
        updatedBy,
      },
      version: 4n,
    });

    const finalModule = ModuleProjector.project(
      orderEvent,
      afterDescUpdate,
    ).unwrapOrThrow();

    expect(finalModule).toEqual({
      id: moduleId,
      title: "Advanced JavaScript Concepts",
      description: "Deep dive into advanced JavaScript features and patterns",
      courseId: courseId,
      order: 2,
      createdBy: createdBy,
      version: 4n,
      updatedAt: orderEvent.timestamp,
      createdAt: addEvent.timestamp,
    });
  });
});
