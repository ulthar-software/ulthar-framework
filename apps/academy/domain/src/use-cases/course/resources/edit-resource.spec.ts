import { type UUID } from "@fabric/core";
import { beforeAll, describe, expect, test } from "@fabric/testing";
import type { MockedDependencies } from "../../../mocks.js";
import { createServiceMocks } from "../../../mocks.js";
import { createCourseMock } from "../../../models/mocks/create-course-mock.js";
import { createUserMock } from "../../../models/mocks/create-user-mock.js";
import { ResourceType } from "../../../models/resource.js";
import type { User } from "../../../models/user.js";
import { Permission } from "../../../security/permission.js";
import { mockUserAccess } from "../../../utils/mock-user-access.js";
import { UnauthorizedError } from "../../../utils/use-case.js";
import { AddResourceToCourse } from "./add-resource-to-course.js";
import { EditResource } from "./edit-resource.js";
import { ResourceNotFoundError } from "./errors.js";

describe("Edit Resource Use Case", () => {
  let courseId: UUID;
  let resourceId: UUID;
  let services: MockedDependencies;
  let admin: User;

  beforeAll(async () => {
    services = await createServiceMocks();
    admin = await createUserMock(services, { role: "ADMIN" });
    courseId = await createCourseMock(services, admin.id);

    // Create a resource to edit
    const result = await AddResourceToCourse.call(
      {
        ...services,
        currentUser: {
          id: admin.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      {
        courseId,
        title: "Original Resource",
        description: "This is the original description",
        url: "http://example.com/original-resource",
        type: ResourceType.DOCUMENTATION,
      },
    ).runOrThrow();

    resourceId = result.resourceId;
  });

  test("Given valid changes, it should edit the resource", async () => {
    const result = await EditResource.call(
      {
        ...services,
        currentUser: {
          id: admin.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      {
        resourceId,
        title: "Updated Resource Title",
        description: "This is the updated description",
        url: "http://example.com/updated-resource",
      },
    ).runOrThrow();

    expect(result.resourceId).toBe(resourceId);

    // Check that resource was updated in the database
    const updatedResource = await services.state
      .from("resources")
      .where({ id: resourceId })
      .selectOneOrFail()
      .runOrThrow();

    expect(updatedResource.title).toBe("Updated Resource Title");
    expect(updatedResource.description).toBe("This is the updated description");
  });

  test("Given a user without permissions, it should deny access", async () => {
    await expect(() =>
      EditResource.call(
        {
          ...services,
          currentUser: mockUserAccess(services, []),
        },
        {
          resourceId,
          title: "Unauthorized Update",
          description: "This user does not have permissions",
        },
      ).runOrThrow(),
    ).rejects.toThrowError(UnauthorizedError);
  });

  test("Given a non-existent resource ID, it should throw an error", async () => {
    const nonExistentResourceId = services.crypto.randomUUID();

    await expect(() =>
      EditResource.call(
        {
          ...services,
          currentUser: mockUserAccess(services, [Permission.EDIT_COURSE]),
        },
        {
          resourceId: nonExistentResourceId,
          title: "Non-existent Resource",
          description: "This resource doesn't exist",
          url: "http://example.com/non-existent-resource",
        },
      ).runOrThrow(),
    ).rejects.toThrowError(ResourceNotFoundError);
  });
});
