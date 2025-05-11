import { SchemaParsingError } from "@fabric/core";
import { beforeEach, describe, expect, test } from "@fabric/testing";
import { createTagMock } from "../../models/mocks/create-tag-mock.js";
import { createUserMock } from "../../models/mocks/create-user-mock.js";
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
});
