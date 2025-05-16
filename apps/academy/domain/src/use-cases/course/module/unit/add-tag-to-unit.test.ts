import type { UUID } from "@fabric/core";
import { beforeAll, describe, expect, test } from "@fabric/testing";

import type { MockedDependencies } from "../../../../mocks.js";
import { createServiceMocks } from "../../../../mocks.js";
import { createCourseMock } from "../../../../models/mocks/create-course-mock.js";
import { createModuleMock } from "../../../../models/mocks/create-module-mock.js";
import { createTagMock } from "../../../../models/mocks/create-tag-mock.js";
import { createUnitMock } from "../../../../models/mocks/create-unit-mock.js";
import { createUserMock } from "../../../../models/mocks/create-user-mock.js";
import type { User } from "../../../../models/user.js";
import { Permission } from "../../../../security/permission.js";
import { TagNotFoundError } from "../../../tag/errors.js";
import { UnitNotFoundError } from "../../errors.js";
import { AddTagToUnitUseCase } from "./add-tag-to-unit.js";

describe("Add tag to unit Use Case", () => {
  let unitId: UUID;
  let services: MockedDependencies;
  let admin: User;

  beforeAll(async () => {
    services = await createServiceMocks();
    admin = await createUserMock(services, { role: "ADMIN" });
    const courseId = await createCourseMock(services, admin.id);
    const moduleId = await createModuleMock(services, admin.id, courseId);
    unitId = await createUnitMock(services, admin.id, moduleId);
  });

  test("Given a valid tag ID, it should add the tag to the unit", async () => {
    const tagId = await createTagMock(services, admin.id);

    await AddTagToUnitUseCase.call(
      {
        ...services,
        currentUser: {
          id: admin.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      {
        unitId,
        tagId,
      },
    ).runOrThrow();

    const unitTag = await services.state
      .from("unitTags")
      .where({
        tagId,
        unitId,
      })
      .selectOneOrFail()
      .runOrThrow();

    expect(unitTag).toBeDefined();
  });

  test("Given an invalid tag ID, it should throw a TagNotFoundError", async () => {
    const invalidTagId = services.crypto.randomUUID();

    await expect(() =>
      AddTagToUnitUseCase.call(
        {
          ...services,
          currentUser: {
            id: admin.id,
            permissions: [Permission.EDIT_COURSE],
          },
        },
        {
          unitId,
          tagId: invalidTagId,
        },
      ).runOrThrow(),
    ).rejects.toThrow(TagNotFoundError);
  });

  test("Given an invalid unit ID, it should throw a UnitNotFoundError", async () => {
    const tagId = await createTagMock(services, admin.id);
    const invalidUnitId = services.crypto.randomUUID();

    await expect(() =>
      AddTagToUnitUseCase.call(
        {
          ...services,
          currentUser: {
            id: admin.id,
            permissions: [Permission.EDIT_COURSE],
          },
        },
        {
          unitId: invalidUnitId,
          tagId,
        },
      ).runOrThrow(),
    ).rejects.toThrow(UnitNotFoundError);
  });

  test("Given a tag already added to the unit, it should fail", async () => {
    const tagId = await createTagMock(services, admin.id);
    await AddTagToUnitUseCase.call(
      {
        ...services,
        currentUser: {
          id: admin.id,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      {
        unitId,
        tagId,
      },
    ).runOrThrow();

    await expect(() =>
      AddTagToUnitUseCase.call(
        {
          ...services,
          currentUser: {
            id: admin.id,
            permissions: [Permission.EDIT_COURSE],
          },
        },
        {
          unitId,
          tagId,
        },
      ).runOrThrow(),
    ).rejects.toThrow(Error);
  });
});
