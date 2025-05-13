import { beforeEach, describe, expect, test } from "@fabric/testing";
import { createInvitationMock } from "../../models/mocks/create-invitation-mock.js";
import { Permission } from "../../security/permission.js";
import { UserRole } from "../../security/user-role.js";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../../services/mocks/create-mock-services.js";
import { mockUserAccess } from "../../utils/mock-user-access.js";
import { ListUserInvitesUseCase } from "./list-user-invites.js";

describe("List User Invites Use Case", () => {
  let services: MockedDependencies;

  beforeEach(async () => {
    services = await createServiceMocks();

    // Create a couple of test invitations
    await createInvitationMock(services, {
      email: "test1@example.com",
      role: UserRole.STUDENT,
    });
    await createInvitationMock(services, {
      email: "test2@example.com",
      role: UserRole.TEACHER,
    });
  });

  test("Should list user invitations with default pagination", async () => {
    // Act
    const result = await ListUserInvitesUseCase.call(
      {
        ...services,
        currentUser: mockUserAccess(services, [Permission.LIST_USERS]),
      },
      {},
    ).runOrThrow();

    // Assert
    expect(result.invitations).toHaveLength(2);
    expect(result.invitations[0]).toHaveProperty("email");
    expect(result.invitations[0]).toHaveProperty("role");
  });

  test("Should support pagination", async () => {
    // Act
    const result = await ListUserInvitesUseCase.call(
      {
        ...services,
        currentUser: mockUserAccess(services, [Permission.LIST_USERS]),
      },
      { page: 1, pageSize: 1 },
    ).runOrThrow();

    // Assert
    expect(result.invitations).toHaveLength(1);
  });

  test("Should support filtering by email", async () => {
    // Act
    const result = await ListUserInvitesUseCase.call(
      {
        ...services,
        currentUser: mockUserAccess(services, [Permission.LIST_USERS]),
      },
      { filter: "test1" },
    ).runOrThrow();

    // Assert
    expect(result.invitations).toHaveLength(1);
    expect(result.invitations[0].email).toBe("test1@example.com");
  });
});
