import { beforeEach, describe, expect, test } from "@fabric/testing";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../services/mocks/create-mock-services.js";
import {
  CourseCreatedEvent,
  CourseDescriptionChangedEvent,
  CourseProjector,
  CourseTitleChangedEvent,
  type Course,
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

  test("Changing course title", () => {
    // First create a course
    const courseId = services.crypto.randomUUID();
    const userId = services.crypto.randomUUID();
    const createEvent: CourseCreatedEvent = CourseCreatedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: courseId,
      payload: {
        title: "Introduction to Programming",
        description: "Learn the basics of programming",
        createdBy: userId,
      },
      version: 1n,
    });

    // Then change the title
    const titleChangeEvent: CourseTitleChangedEvent =
      CourseTitleChangedEvent.from({
        id: services.crypto.randomUUID(),
        streamId: courseId,
        payload: {
          title: "Advanced Programming Concepts",
          updatedBy: userId,
        },
        version: 2n,
      });

    // Project both events
    const initialCourse = CourseProjector.project(createEvent).unwrapOrThrow();
    // Pass initialCourse as the second parameter with the correct type
    const updatedCourse = CourseProjector.project(
      titleChangeEvent,
      initialCourse as Course,
    ).unwrapOrThrow();

    // Assertions
    expect(updatedCourse).toEqual({
      id: courseId,
      title: "Advanced Programming Concepts", // Title should be updated
      description: "Learn the basics of programming",
      createdBy: userId,
      version: 2n, // Version should be incremented
      updatedAt: titleChangeEvent.timestamp, // Updated timestamp
      createdAt: createEvent.timestamp, // Original creation timestamp
    });
  });

  test("Changing course description", () => {
    // First create a course
    const courseId = services.crypto.randomUUID();
    const userId = services.crypto.randomUUID();
    const createEvent: CourseCreatedEvent = CourseCreatedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: courseId,
      payload: {
        title: "Introduction to Programming",
        description: "Learn the basics of programming",
        createdBy: userId,
      },
      version: 1n,
    });

    // Then change the description
    const descriptionChangeEvent: CourseDescriptionChangedEvent =
      CourseDescriptionChangedEvent.from({
        id: services.crypto.randomUUID(),
        streamId: courseId,
        payload: {
          description:
            "Comprehensive guide to programming fundamentals and advanced concepts",
          updatedBy: userId,
        },
        version: 2n,
      });

    // Project both events
    const initialCourse = CourseProjector.project(createEvent).unwrapOrThrow();
    // Pass initialCourse as the second parameter with the correct type
    const updatedCourse = CourseProjector.project(
      descriptionChangeEvent,
      initialCourse as Course,
    ).unwrapOrThrow();

    // Assertions
    expect(updatedCourse).toEqual({
      id: courseId,
      title: "Introduction to Programming",
      description:
        "Comprehensive guide to programming fundamentals and advanced concepts", // Description should be updated
      createdBy: userId,
      version: 2n, // Version should be incremented
      updatedAt: descriptionChangeEvent.timestamp, // Updated timestamp
      createdAt: createEvent.timestamp, // Original creation timestamp
    });
  });
});
