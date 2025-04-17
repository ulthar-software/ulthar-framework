/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { SchemaParsingError } from "@fabric/core";
import { beforeEach, describe, expect, test } from "@fabric/testing";
import { createUserMock } from "../../models/mocks/create-user-mock.js";
import type { User } from "../../models/user.js";
import { Permission } from "../../security/permission.js";
import { UserRole } from "../../security/user-role.js";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../../services/mocks/create-mock-services.js";
import { UnauthorizedError } from "../../utils/use-case.js";
import { CreateCourseUseCase } from "./create-course.js";

describe("Create Course Use Case", () => {
  let services: MockedDependencies;
  let adminUser: User;
  let teacherUser: User;

  beforeEach(async () => {
    services = await createServiceMocks();

    // Create an admin user with admin role
    adminUser = await createUserMock(services, {
      email: "admin@example.com",
      role: UserRole.ADMIN,
    });

    // Create a teacher user
    teacherUser = await createUserMock(services, {
      email: "teacher@example.com",
      role: UserRole.TEACHER,
    });
  });

  test("Admin should successfully create a new course", async () => {
    // Arrange
    const courseData = {
      title: "Advanced TypeScript",
      description: "A comprehensive course on TypeScript features and patterns",
    };

    // Act
    const result = await CreateCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: adminUser.id,
          permissions: [Permission.CREATE_COURSE],
        },
      },
      courseData,
    ).runOrThrow();

    // Assert - verify that a course was created in the database
    expect(result).toEqual({
      courseId: expect.any(String),
    });

    // Verify the course is in the database
    const courseInDb = await services.state
      .from("courses")
      .where({ id: result.courseId })
      .selectOneOrFail()
      .runOrThrow();

    expect(courseInDb).toEqual(
      expect.objectContaining({
        title: courseData.title,
        description: courseData.description,
        createdBy: adminUser.id,
      }),
    );
  });

  test("Teacher should successfully create a new course", async () => {
    // Arrange
    const courseData = {
      title: "Introduction to JavaScript",
      description: "Learn the basics of JavaScript programming",
    };

    // Act
    const result = await CreateCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: teacherUser.id,
          permissions: [Permission.CREATE_COURSE],
        },
      },
      courseData,
    ).runOrThrow();

    // Assert
    expect(result).toEqual({
      courseId: expect.any(String),
    });

    // Verify the course is in the database
    const courseInDb = await services.state
      .from("courses")
      .where({ id: result.courseId })
      .selectOneOrFail()
      .runOrThrow();

    expect(courseInDb).toEqual(
      expect.objectContaining({
        title: courseData.title,
        description: courseData.description,
        createdBy: teacherUser.id,
      }),
    );
  });

  test("Should successfully create a course without providing description", async () => {
    // Arrange
    const courseData = {
      title: "TypeScript Basics",
      // description field intentionally omitted
    };

    // Act
    const result = await CreateCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: adminUser.id,
          permissions: [Permission.CREATE_COURSE],
        },
      },
      courseData,
    ).runOrThrow();

    // Assert
    expect(result).toEqual({
      courseId: expect.any(String),
    });

    // Verify the course is in the database
    const courseInDb = await services.state
      .from("courses")
      .where({ id: result.courseId })
      .selectOneOrFail()
      .runOrThrow();

    expect(courseInDb).toEqual(
      expect.objectContaining({
        title: courseData.title,
        description: "", // Expect description to be empty
        createdBy: adminUser.id,
      }),
    );
  });

  test("Should fail when course title is empty", async () => {
    // Arrange
    const courseData = {
      title: "",
      description: "This course has an empty title",
    };

    // Act
    const result = await CreateCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: adminUser.id,
          permissions: [Permission.CREATE_COURSE],
        },
      },
      courseData,
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    const error = result.unwrapErrorOrThrow();
    expect(error).toBeInstanceOf(SchemaParsingError);
  });

  test("Should fail when user doesn't have CREATE_COURSE permission", async () => {
    // Arrange
    const courseData = {
      title: "Unauthorized Course",
      description: "This course shouldn't be created without permission",
    };

    // Act - Admin user without the CREATE_COURSE permission
    const result = await CreateCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: adminUser.id,
          permissions: [], // Empty permissions array
        },
      },
      courseData,
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    const error = result.unwrapErrorOrThrow();
    expect(error).toBeInstanceOf(UnauthorizedError);
  });
});
