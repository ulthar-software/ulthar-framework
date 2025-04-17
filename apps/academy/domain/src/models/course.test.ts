import { beforeEach, describe, expect, test } from "@fabric/testing";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../services/mocks/create-mock-services.js";
import { CourseCreatedEvent, CourseProjector } from "./course.js";

describe("Course", () => {
  let services: MockedDependencies;

  beforeEach(async () => {
    services = await createServiceMocks();
  });

  test("Creating a course", () => {
    const courseId = services.crypto.randomUUID();
    const event: CourseCreatedEvent = CourseCreatedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: courseId,
      payload: {
        title: "Introduction to Programming",
        description: "Learn the basics of programming",
        createdBy: services.crypto.randomUUID(),
      },
      version: 1n,
    });

    const course = CourseProjector.project(event).unwrapOrThrow();

    expect(course).toEqual({
      id: courseId,
      title: "Introduction to Programming",
      description: "Learn the basics of programming",
      createdBy: event.payload.createdBy,
      version: 1n,
      updatedAt: event.timestamp,
      createdAt: event.timestamp,
    });
  });
});
