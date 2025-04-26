import { SchemaParsingError } from "@fabric/core";
import { beforeEach, describe, expect, test } from "@fabric/testing";
import { createUserMock } from "../../models/mocks/create-user-mock.js";
import type { User } from "../../models/user.js";
import { Permission } from "../../security/permission.js";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../../services/mocks/create-mock-services.js";
import { UnauthorizedError } from "../../utils/use-case.js";
import { CreateTagUseCase } from "./create-tag.js";
import { TagAlreadyExistsError } from "./errors.js";

describe("Create Tag Use Case", () => {
  let services: MockedDependencies;
  let user: User;

  beforeEach(async () => {
    services = await createServiceMocks();
    user = await createUserMock(services);
  });

  test("Given a valid tag name, it should create a new tag", async () => {
    // Arrange
    const tagData = {
      name: "JavaScript",
    };

    // Act
    const result = await CreateTagUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.MANAGE_TAGS],
        },
      },
      tagData,
    ).run();

    // Assert
    expect(result.isOk()).toBe(true);
    const { tagId } = result.unwrapOrThrow();
    expect(tagId).toBeDefined();

    // Verify the tag is in the database
    const tagInDb = await services.state
      .from("tags")
      .where({ id: tagId })
      .selectOneOrFail()
      .run();

    expect(tagInDb.unwrapOrThrow()).toEqual(
      expect.objectContaining({
        id: tagId,
        name: tagData.name,
        createdBy: user.id,
      }),
    );
  });

  test("Given a user without permission, it should return UnauthorizedError", async () => {
    // Arrange
    const tagData = {
      name: "JavaScript",
    };

    // Act
    const result = await CreateTagUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [], // No permissions
        },
      },
      tagData,
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(UnauthorizedError);
  });

  test("Given invalid input data, it should return SchemaParsingError", async () => {
    // Arrange
    const invalidTagData = {
      name: "", // Empty name is invalid
    };

    // Act
    const result = await CreateTagUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.MANAGE_TAGS],
        },
      },
      invalidTagData,
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(SchemaParsingError);
  });

  test("Given a tag name that already exists, it should return TagAlreadyExistsError", async () => {
    // Arrange
    const tagData = {
      name: "JavaScript",
    };

    // First, create a tag with the same name
    await CreateTagUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.MANAGE_TAGS],
        },
      },
      tagData,
    ).run();

    // Act - try to create another tag with the same name
    const result = await CreateTagUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.MANAGE_TAGS],
        },
      },
      tagData,
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    const error = result.unwrapErrorOrThrow();
    expect(error).toBeInstanceOf(TagAlreadyExistsError);
    expect((error as TagAlreadyExistsError).tagName).toEqual(tagData.name);
  });
});
