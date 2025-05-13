import { beforeEach, describe, expect, test } from "@fabric/testing";
import { createUserMock } from "../../models/mocks/create-user-mock.js";
import { Permission } from "../../security/permission.js";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../../services/mocks/create-mock-services.js";
import { ListUsersUseCase } from "./list-users.js";

describe("List Users Use Case", () => {
  let services: MockedDependencies;

  beforeEach(async () => {
    services = await createServiceMocks();

    await createUserMock(services);
    await createUserMock(services);
  });

  test("Should list users with default pagination", async () => {
    // Act
    const result = await ListUsersUseCase.call(
      {
        ...services,
        currentUser: {
          id: services.crypto.randomUUID(),
          permissions: [Permission.LIST_USERS],
        },
      },
      {},
    ).runOrThrow();

    // Assert
    expect(result.users).toHaveLength(2);
    expect(result.users[0]).not.toHaveProperty("hashedPassword");
  });

  test("Should support pagination", async () => {
    // Act
    const result = await ListUsersUseCase.call(
      {
        ...services,
        currentUser: {
          id: services.crypto.randomUUID(),
          permissions: [Permission.LIST_USERS],
        },
      },
      { page: 1, pageSize: 1 },
    ).runOrThrow();

    // Assert
    expect(result.users).toHaveLength(1);
  });
});
