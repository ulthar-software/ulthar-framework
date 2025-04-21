import { beforeEach, describe, expect, test } from "@fabric/testing";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../services/mocks/create-mock-services.js";
import { EnrollmentProjector, UserEnrolledEvent } from "./enrollment.js";

describe("Enrollment", () => {
  let services: MockedDependencies;

  beforeEach(async () => {
    services = await createServiceMocks();
  });

  test("Enrolling a user in a course", () => {
    // Setup
    const enrollmentId = services.crypto.randomUUID();
    const userId = services.crypto.randomUUID();
    const courseId = services.crypto.randomUUID();

    // Create the enrollment event
    const event = UserEnrolledEvent.from({
      id: services.crypto.randomUUID(),
      streamId: enrollmentId,
      payload: {
        userId,
        courseId,
      },
      version: 1n,
    });

    // Project the event to create an enrollment
    const enrollment = EnrollmentProjector.project(event).unwrapOrThrow();

    // Assertions
    expect(enrollment).toEqual({
      id: enrollmentId,
      userId,
      courseId,
      active: true,
      version: 1n,
      updatedAt: event.timestamp,
      createdAt: event.timestamp,
    });
  });
});
