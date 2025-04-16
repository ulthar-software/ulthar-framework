/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { UUID } from "@fabric/core";
import { beforeEach, describe, expect, test } from "@fabric/testing";
import { createUserMock } from "../../models/mocks/create-user-mock.js";
import { Permission } from "../../security/permission.js";
import { UserRole } from "../../security/user-role.js";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../../services/mocks/create-mock-services.js";
import { UnauthorizedError } from "../../utils/use-case.js";
import {
  InviteUserUseCase,
  UserAlreadyExistsError,
  UserAlreadyInvitedError,
} from "./invite-user.js";

describe("Invite User Use Case", () => {
  let services: MockedDependencies;
  let adminUser: { id: UUID; email: string };

  beforeEach(async () => {
    services = await createServiceMocks();

    // Create an admin user with admin role
    adminUser = await createUserMock(services, {
      email: "admin@example.com",
      role: UserRole.ADMIN,
    });
  });

  test("Should successfully invite a new student and produce an event", async () => {
    // Arrange
    const testingEmail = "student@example.com";
    const testingRole = UserRole.STUDENT;

    // Act
    await InviteUserUseCase.call(
      {
        ...services,
        currentUser: {
          id: adminUser.id,
          permissions: [Permission.INVITE_USERS],
        },
      },
      {
        email: testingEmail,
        role: testingRole,
      },
    ).runOrThrow();

    // Assert - verify that an invitation was created in the database
    const inviteInDb = await services.state
      .from("userInvites")
      .where({ email: testingEmail })
      .selectOneOrFail()
      .runOrThrow();

    expect(inviteInDb).toEqual(
      expect.objectContaining({
        email: testingEmail,
        role: testingRole,
        code: expect.any(String),
      }),
    );
  });

  test("Should successfully invite a new teacher", async () => {
    // Arrange
    const testingEmail = "teacher@example.com";
    const testingRole = UserRole.TEACHER;

    // Act
    await InviteUserUseCase.call(
      {
        ...services,
        currentUser: {
          id: adminUser.id,
          permissions: [Permission.INVITE_USERS],
        },
      },
      {
        email: testingEmail,
        role: testingRole,
      },
    ).runOrThrow();

    // Assert - verify the projection was created
    const inviteInDb = await services.state
      .from("userInvites")
      .where({ email: testingEmail })
      .selectOneOrFail()
      .runOrThrow();

    expect(inviteInDb).toEqual(
      expect.objectContaining({
        email: testingEmail,
        role: testingRole,
        code: expect.any(String),
      }),
    );
  });

  test("Should successfully invite a new admin", async () => {
    // Arrange
    const testingEmail = "newadmin@example.com";
    const testingRole = UserRole.ADMIN;

    // Act
    await InviteUserUseCase.call(
      {
        ...services,
        currentUser: {
          id: adminUser.id,
          permissions: [Permission.INVITE_USERS],
        },
      },
      {
        email: testingEmail,
        role: testingRole,
      },
    ).runOrThrow();

    // Assert - verify the projection was created
    const inviteInDb = await services.state
      .from("userInvites")
      .where({ email: testingEmail })
      .selectOneOrFail()
      .runOrThrow();

    expect(inviteInDb).toEqual(
      expect.objectContaining({
        email: testingEmail,
        role: testingRole,
        code: expect.any(String),
      }),
    );
  });

  test("Should fail when trying to invite an already registered user", async () => {
    // Arrange - Create a user first
    const testingEmail = "existing@example.com";
    await createUserMock(services, {
      email: testingEmail,
    });

    // Act
    const result = await InviteUserUseCase.call(
      {
        ...services,
        currentUser: {
          id: adminUser.id,
          permissions: [Permission.INVITE_USERS],
        },
      },
      {
        email: testingEmail,
        role: UserRole.STUDENT,
      },
    ).run();

    // Assert
    expect(result.isError()).toBe(true);

    // Check that the error is the expected type
    const error = result.unwrapErrorOrThrow();
    expect(error).toBeInstanceOf(UserAlreadyExistsError);
  });

  test("Should fail when trying to invite an already invited user", async () => {
    // Arrange
    const testingEmail = "alreadyinvited@example.com";

    // First invitation
    await InviteUserUseCase.call(
      {
        ...services,
        currentUser: {
          id: adminUser.id,
          permissions: [Permission.INVITE_USERS],
        },
      },
      {
        email: testingEmail,
        role: UserRole.STUDENT,
      },
    ).runOrThrow();

    // Act - Second invitation
    const result = await InviteUserUseCase.call(
      {
        ...services,
        currentUser: {
          id: adminUser.id,
          permissions: [Permission.INVITE_USERS],
        },
      },
      {
        email: testingEmail,
        role: UserRole.STUDENT,
      },
    ).run();

    // Assert
    expect(result.isError()).toBe(true);

    // Check that the error is the expected type
    const error = result.unwrapErrorOrThrow();
    expect(error).toBeInstanceOf(UserAlreadyInvitedError);
  });

  test("Should fail when caller doesn't have the required permission", async () => {
    // Arrange - Create a user with student role
    const regularUser = await createUserMock(services, {
      email: "regular@example.com",
      role: UserRole.STUDENT,
    });

    // Act
    const result = await InviteUserUseCase.call(
      {
        ...services,
        currentUser: {
          id: regularUser.id,
          permissions: [], // Empty permissions
        },
      },
      {
        email: "newstudent@example.com",
        role: UserRole.STUDENT,
      },
    ).run();

    // Assert
    expect(result.isError()).toBe(true);

    // Check for UnauthorizedError
    const error = result.unwrapErrorOrThrow();
    expect(error).toBeInstanceOf(UnauthorizedError);
  });
});
