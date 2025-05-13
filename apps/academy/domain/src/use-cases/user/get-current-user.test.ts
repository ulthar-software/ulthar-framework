import type { UUID } from "@fabric/core";
import { beforeEach, describe, expect, test } from "@fabric/testing";
import { createUserMock } from "../../models/mocks/create-user-mock.js";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../../services/mocks/create-mock-services.js";
import {
  GetCurrentUserUseCase,
  UserNotFoundError,
} from "./get-current-user.js";

describe("Get Current User Use Case", () => {
  let services: MockedDependencies;
  let userId: UUID;

  beforeEach(async () => {
    services = await createServiceMocks();

    // Create a test user
    const user = await createUserMock(services);
    userId = user.id;
  });

  test("Should return the current user information", async () => {
    // Act
    const result = await GetCurrentUserUseCase.call(
      {
        ...services,
        currentUser: {
          id: userId,
          permissions: [],
        },
      },
      {},
    ).runOrThrow();

    // Assert
    expect(result.user).toBeDefined();
    expect(result.user.id).toBe(userId);
    expect(result.user.firstName).toBeDefined();
    expect(result.user.lastName).toBeDefined();
    expect(result.user.email).toBeDefined();
    expect(result.user.role).toBeDefined();
    expect(result.user).not.toHaveProperty("hashedPassword");
  });

  test("Should throw UserNotFoundError when user not found in database", async () => {
    // Arrange
    const nonExistentUserId = services.crypto.randomUUID();
    const dependencies = {
      ...services,
      currentUser: {
        id: nonExistentUserId,
        permissions: [],
      },
    };

    // Act & Assert
    await expect(
      GetCurrentUserUseCase.call(dependencies, {}).runOrThrow(),
    ).rejects.toThrow(UserNotFoundError);
  });
});
