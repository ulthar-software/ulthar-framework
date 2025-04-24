import type { UUID } from "@fabric/core";
import { beforeEach, describe, expect, test } from "@fabric/testing";
import { UserEnrolledEvent } from "../../models/enrollment.js";
import { createCourseMock } from "../../models/mocks/create-course-mock.js";
import { createUserMock } from "../../models/mocks/create-user-mock.js";
import type { User } from "../../models/user.js";
import { Permission } from "../../security/permission.js";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../../services/mocks/create-mock-services.js";
import { GetAllCoursesUseCase } from "./get-all-courses.js";

describe("Get All Courses Use Case", () => {
  let services: MockedDependencies;
  let user: User;
  let courseIds: UUID[] = [];

  beforeEach(async () => {
    services = await createServiceMocks();
    user = await createUserMock(services);

    // Create a few courses for testing
    courseIds = [
      await createCourseMock(services, user.id),
      await createCourseMock(services, user.id),
      await createCourseMock(services, user.id),
    ];
  });

  // Helper function to create an enrollment
  async function enrollStudentInCourse(userId: UUID, courseId: UUID) {
    const enrollmentId = services.crypto.randomUUID();
    const eventId = services.crypto.randomUUID();

    const enrollmentEvent = UserEnrolledEvent.from({
      id: eventId,
      streamId: enrollmentId,
      payload: {
        userId,
        courseId,
      },
      version: 1,
    });

    await services.events.append("enrollments", enrollmentEvent).runOrThrow();
    return enrollmentId;
  }

  test("Admin should successfully get all courses", async () => {
    // Act
    const result = await GetAllCoursesUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.VIEW_COURSE],
        },
      },
      {},
    ).runOrThrow();

    // Assert
    expect(result.courses).toHaveLength(3);
    expect(result.courses.map((course) => course.id)).toEqual(
      expect.arrayContaining(courseIds),
    );
  });

  test("User without VIEW_COURSE permission should only see enrolled courses", async () => {
    // Arrange - Only enroll the user in one course
    await enrollStudentInCourse(user.id, courseIds[0]);

    // Act
    const result = await GetAllCoursesUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [], // No VIEW_COURSE permission
        },
      },
      {},
    ).runOrThrow();

    // Assert
    expect(result.courses).toHaveLength(1);
    expect(result.courses[0].id).toBe(courseIds[0]);
  });

  test("User enrolled in multiple courses should see all enrolled courses", async () => {
    // Arrange - Enroll the user in two courses
    await enrollStudentInCourse(user.id, courseIds[0]);
    await enrollStudentInCourse(user.id, courseIds[1]);

    // Act
    const result = await GetAllCoursesUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [], // No VIEW_COURSE permission
        },
      },
      {},
    ).runOrThrow();

    // Assert
    expect(result.courses).toHaveLength(2);
    expect(result.courses.map((course) => course.id)).toContain(courseIds[0]);
    expect(result.courses.map((course) => course.id)).toContain(courseIds[1]);
    expect(result.courses.map((course) => course.id)).not.toContain(
      courseIds[2],
    );
  });

  test("User with no enrollments should see empty course list", async () => {
    // Act
    const result = await GetAllCoursesUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [], // No VIEW_COURSE permission
        },
      },
      {},
    ).runOrThrow();

    // Assert
    expect(result.courses).toHaveLength(0);
  });
});
