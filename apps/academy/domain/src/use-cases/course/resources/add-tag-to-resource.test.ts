import type { UUID } from "@fabric/core";
import { beforeAll, describe, expect, test } from "@fabric/testing";
import type { MockedDependencies } from "../../../mocks.js";
import { createServiceMocks } from "../../../mocks.js";
import { createCourseMock } from "../../../models/mocks/create-course-mock.js";
import { createResourceMock } from "../../../models/mocks/create-resource-mock.js";
import { createTagMock } from "../../../models/mocks/create-tag-mock.js";
import { createUserMock } from "../../../models/mocks/create-user-mock.js";
import type { User } from "../../../models/user.js";
import { Permission } from "../../../security/permission.js";
import { TagNotFoundError } from "../../tag/errors.js";
import { AddTagToResourceUseCase } from "./add-tag-to-resource.js";

describe("Add tag to resource Use Case", () => {
  let courseId: UUID;
  let services: MockedDependencies;
  let admin: User;
  let resourceId: UUID;

  beforeAll(async () => {
    services = await createServiceMocks();
    admin = await createUserMock(services, { role: "ADMIN" });
    courseId = await createCourseMock(services, admin.id);
    resourceId = await createResourceMock(services, admin.id, courseId);
  });

  test("Given a valid tag ID, it should add the tag to the resource", async () => {
    const tagId = await createTagMock(services, admin.id);

    await AddTagToResourceUseCase.call(
      {
        ...services,
        currentUser: {
          id: admin.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      {
        resourceId,
        tagId,
      },
    ).runOrThrow();

    const resourceTag = await services.state
      .from("resourceTags")
      .where({
        tagId,
        resourceId,
      })
      .selectOneOrFail()
      .runOrThrow();

    expect(resourceTag).toBeDefined();
  });

  test("Given an invalid tag ID, it should throw a TagNotFoundError", async () => {
    const invalidTagId = services.crypto.randomUUID();

    await expect(() =>
      AddTagToResourceUseCase.call(
        {
          ...services,
          currentUser: {
            id: admin.id,
            permissions: [Permission.EDIT_COURSE],
          },
        },
        {
          resourceId,
          tagId: invalidTagId,
        },
      ).runOrThrow(),
    ).rejects.toThrow(TagNotFoundError);
  });
});
