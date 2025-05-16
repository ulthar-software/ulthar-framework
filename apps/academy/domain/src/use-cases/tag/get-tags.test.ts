import { SchemaParsingError } from "@fabric/core";
import { beforeEach, describe, expect, test } from "@fabric/testing";
import { createCourseMock } from "../../models/mocks/create-course-mock.js";
import { createModuleMock } from "../../models/mocks/create-module-mock.js";
import { createTagMock } from "../../models/mocks/create-tag-mock.js";
import { createUnitMock } from "../../models/mocks/create-unit-mock.js";
import { createUserMock } from "../../models/mocks/create-user-mock.js";
import { UnitTagCreatedEvent } from "../../models/unit-tag.js";
import type { User } from "../../models/user.js";
import { Permission } from "../../security/permission.js";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../../services/mocks/create-mock-services.js";
import { UnauthorizedError } from "../../utils/use-case.js";
import { GetTagsUseCase } from "./get-tags.js";

describe("Get Tags Use Case", () => {
  let services: MockedDependencies;
  let user: User;

  beforeEach(async () => {
    services = await createServiceMocks();
    user = await createUserMock(services);

    await Promise.all(
      Array.from({ length: 20 }).map(async () => {
        await createTagMock(services, user.id);
      }),
    );

    await createTagMock(services, user.id, {
      name: "JavaScript",
    });
  });

  test("Given no filter and limit, it should return a default list of tags", async () => {
    // Act
    const result = await GetTagsUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.MANAGE_TAGS],
        },
      },
      {},
    ).run();

    // Assert
    expect(result.unwrapOrThrow().tags).toHaveLength(10);
  });

  test("Given a filter, it should return matching tags", async () => {
    // Act
    const result = await GetTagsUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.MANAGE_TAGS],
        },
      },
      { filter: "Java" },
    ).run();

    // Assert
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOrThrow().tags).toContainEqual(
      expect.objectContaining({
        name: "JavaScript",
      }),
    );
  });

  test("Given a limit, it should return only that many tags", async () => {
    // Act
    const result = await GetTagsUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.MANAGE_TAGS],
        },
      },
      { limit: 1 },
    ).run();

    // Assert
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOrThrow().tags).toHaveLength(1);
  });

  test("Given a user without permission, it should return UnauthorizedError", async () => {
    // Act
    const result = await GetTagsUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [], // No permissions
        },
      },
      {},
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(UnauthorizedError);
  });

  test("Given invalid input data, it should return SchemaParsingError", async () => {
    // Act
    const result = await GetTagsUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.MANAGE_TAGS],
        },
      },
      { limit: -1 },
    ).run();

    // Assert
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(SchemaParsingError);
  });

  test("Given idToFilter and typeToFilter=UNIT, it should return tags linked to the unit", async () => {
    // Arrange: create a unit and link tags to it
    const courseId = await createCourseMock(services, user.id);
    const moduleId = await createModuleMock(services, user.id, courseId);
    const unitId = await createUnitMock(services, user.id, moduleId);
    const tag1Id = await createTagMock(services, user.id, { name: "UnitTag1" });

    await services.events
      .append(
        "unitTags",
        UnitTagCreatedEvent.from({
          id: services.crypto.randomUUID(),
          payload: {
            unitId,
            tagId: tag1Id,
            createdBy: user.id,
          },
          streamId: unitId,
          version: 1,
        }),
      )
      .runOrThrow();

    // Act
    const result = await GetTagsUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.MANAGE_TAGS],
        },
      },
      { idToFilter: unitId, typeToFilter: "UNIT" },
    ).run();

    // Assert
    expect(result.isOk()).toBe(true);
    const tags = result.unwrapOrThrow().tags;
    expect(tags).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: tag1Id })]),
    );

    expect(tags.length).toEqual(10); // default limit
  });
});
