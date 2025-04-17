import { beforeEach, describe, expect, test } from "@fabric/testing";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../services/mocks/create-mock-services.js";
import {
  CourseCreatedEvent,
  CourseProjector,
  CourseUpdatedEvent,
} from "./course.js";

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

  test("Updating a course", () => {
    // First create a course
    const courseId = services.crypto.randomUUID();
    const createEvent: CourseCreatedEvent = CourseCreatedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: courseId,
      payload: {
        title: "Introduction to Programming",
        description: "Learn the basics of programming",
        createdBy: services.crypto.randomUUID(),
      },
      version: 1n,
    });

    const course = CourseProjector.project(createEvent).unwrapOrThrow();

    if (!course) throw new Error("Course was not created");

    // Then update the course
    const updateEvent: CourseUpdatedEvent = CourseUpdatedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: courseId,
      payload: {
        title: "Advanced Programming Concepts",
        description: "Deep dive into advanced programming topics",
        updatedBy: services.crypto.randomUUID(),
      },
      version: 2n,
    });

    const updatedCourse = CourseProjector.project(
      updateEvent,
      course,
    ).unwrapOrThrow();

    expect(updatedCourse).toEqual({
      id: courseId,
      title: "Advanced Programming Concepts",
      description: "Deep dive into advanced programming topics",
      createdBy: course.createdBy,
      version: 2n,
      updatedAt: updateEvent.timestamp,
      createdAt: course.createdAt,
    });
  });
});
