import { SchemaParsingError, type UUID } from "@fabric/core";
import { beforeAll, describe, expect, test } from "@fabric/testing";
import type { MockedDependencies } from "../../../mocks.js";
import { createServiceMocks } from "../../../mocks.js";
import { createCourseMock } from "../../../models/mocks/create-course-mock.js";
import { createTagMock } from "../../../models/mocks/create-tag-mock.js";
import { createUserMock } from "../../../models/mocks/create-user-mock.js";
import { ResourceType } from "../../../models/resource.js";
import type { User } from "../../../models/user.js";
import { Permission } from "../../../security/permission.js";
import { mockUserAccess } from "../../../utils/mock-user-access.js";
import { UnauthorizedError } from "../../../utils/use-case.js";
import { TagNotFoundError } from "../../tag/errors.js";
import { CourseNotFoundError } from "../errors.js";
import { AddResourceToCourseUseCase } from "./add-resource-to-course.js";

describe("Add Resource to Course Use Case", () => {
  let courseId: UUID;
  let services: MockedDependencies;
  let admin: User;
  let tagId1: UUID;
  let tagId2: UUID;

  beforeAll(async () => {
    services = await createServiceMocks();
    admin = await createUserMock(services, { role: "ADMIN" });
    courseId = await createCourseMock(services, admin.id);
    tagId1 = await createTagMock(services, admin.id);
    tagId2 = await createTagMock(services, admin.id);
  });

  test("Given a valid resource, it should add the resource to the course", async () => {
    const result = await AddResourceToCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: admin.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      {
        courseId,
        title: "New Resource",
        description: "This is a new resource",
        url: "http://example.com/resource",
        type: ResourceType.DOCUMENTATION,
      },
    ).runOrThrow();

    expect(result.resourceId).toBeDefined();
  });

  test("Given an invalid resource type, it should throw an error", async () => {
    await expect(
      AddResourceToCourseUseCase.call(
        {
          ...services,
          currentUser: mockUserAccess(services, [Permission.EDIT_COURSE]),
        },
        {
          courseId,
          title: "Invalid Resource",
          description: "This resource has an invalid type",
          url: "http://example.com/invalid-resource",
          type: "INVALID_TYPE",
        },
      ).runOrThrow(),
    ).rejects.toThrowError(SchemaParsingError);
  });

  test("Given a user without permissions, it should deny access", async () => {
    await expect(() =>
      AddResourceToCourseUseCase.call(
        {
          ...services,
          currentUser: mockUserAccess(services, []),
        },
        {
          courseId,
          title: "Unauthorized Resource",
          description: "This user does not have permissions",
          url: "http://example.com/unauthorized-resource",
          type: ResourceType.DOCUMENTATION,
        },
      ).runOrThrow(),
    ).rejects.toThrowError(UnauthorizedError);
  });

  test("Given a missing course ID, it should throw an error", async () => {
    await expect(() =>
      AddResourceToCourseUseCase.call(
        {
          ...services,
          currentUser: mockUserAccess(services, [Permission.EDIT_COURSE]),
        },
        {
          courseId: services.crypto.randomUUID(),
          title: "Missing Course",
          description: "This resource is missing a course ID",
          url: "http://example.com/missing-course",
          type: ResourceType.DOCUMENTATION,
        },
      ).runOrThrow(),
    ).rejects.toThrowError(CourseNotFoundError);
  });

  test("Given a valid resource with tags, it should add the resource to the course with the tags", async () => {
    const result = await AddResourceToCourseUseCase.call(
      {
        ...services,
        currentUser: {
          id: admin.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      {
        courseId,
        title: "Resource with Tags",
        description: "This resource has tags",
        url: "http://example.com/resource-with-tags",
        type: ResourceType.DOCUMENTATION,
        tagIds: [tagId1, tagId2],
      },
    ).runOrThrow();

    // Assert
    expect(result.resourceId).toBeDefined();
    // Additional assertions to verify tags can be added here
  });

  test("Given a resource with some non-existent tags, it should throw an error", async () => {
    // Arrange
    const nonExistentTagId = services.crypto.randomUUID();

    await expect(
      AddResourceToCourseUseCase.call(
        {
          ...services,
          currentUser: {
            id: admin.id,
            permissions: [Permission.EDIT_COURSE],
          },
        },
        {
          courseId,
          title: "Resource with Invalid Tags",
          description: "This resource has some invalid tags",
          url: "http://example.com/resource-with-invalid-tags",
          type: ResourceType.DOCUMENTATION,
          tagIds: [tagId1, nonExistentTagId],
        },
      ).runOrThrow(),
    ).rejects.toThrowError(TagNotFoundError);
  });
});
