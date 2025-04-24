import { beforeEach, describe, expect, test } from "@fabric/testing";
import { UserRole } from "../security/user-role.js";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../services/mocks/create-mock-services.js";
import {
  UserPasswordChangedEvent,
  UserProjector,
  UserRegisteredByInvitationEvent,
  UserRoleChangedEvent,
} from "./user.js";

describe("User", () => {
  let services: MockedDependencies;

  beforeEach(async () => {
    services = await createServiceMocks();
  });

  test("Registering a user by invitation", () => {
    const userId = services.crypto.randomUUID();
    const invitedBy = services.crypto.randomUUID();
    const event = UserRegisteredByInvitationEvent.from({
      id: services.crypto.randomUUID(),
      streamId: userId,
      payload: {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        hashedPassword: "hashed_password_123",
        role: UserRole.STUDENT,
        invitedBy,
      },
      version: 1,
    });

    const user = UserProjector.project(event).unwrapOrThrow();

    expect(user).toEqual({
      id: userId,
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      hashedPassword: "hashed_password_123",
      role: UserRole.STUDENT,
      invitedBy,
      version: 1,
      updatedAt: event.timestamp,
      createdAt: event.timestamp,
    });
  });

  test("Changing user role", () => {
    // First register a user
    const userId = services.crypto.randomUUID();
    const invitedBy = services.crypto.randomUUID();
    const registerEvent = UserRegisteredByInvitationEvent.from({
      id: services.crypto.randomUUID(),
      streamId: userId,
      payload: {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@example.com",
        hashedPassword: "hashed_password_456",
        role: UserRole.STUDENT,
        invitedBy,
      },
      version: 1,
    });

    const user = UserProjector.project(registerEvent).unwrapOrThrow();

    if (!user) throw new Error("User was not registered");

    // Then change the user's role
    const changedBy = services.crypto.randomUUID();
    const roleChangeEvent = UserRoleChangedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: userId,
      payload: {
        role: UserRole.TEACHER,
        changedBy,
      },
      version: 2,
    });

    const updatedUser = UserProjector.project(
      roleChangeEvent,
      user,
    ).unwrapOrThrow();

    expect(updatedUser).toEqual({
      id: userId,
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@example.com",
      hashedPassword: "hashed_password_456",
      role: UserRole.TEACHER,
      invitedBy,
      version: 2,
      updatedAt: roleChangeEvent.timestamp,
      createdAt: user.createdAt,
    });
  });

  test("Changing user password", () => {
    // First register a user
    const userId = services.crypto.randomUUID();
    const invitedBy = services.crypto.randomUUID();
    const registerEvent = UserRegisteredByInvitationEvent.from({
      id: services.crypto.randomUUID(),
      streamId: userId,
      payload: {
        firstName: "Alice",
        lastName: "Johnson",
        email: "alice.johnson@example.com",
        hashedPassword: "original_hashed_password",
        role: UserRole.ADMIN,
        invitedBy,
      },
      version: 1,
    });

    const user = UserProjector.project(registerEvent).unwrapOrThrow();

    if (!user) throw new Error("User was not registered");

    // Then change the user's password
    const passwordChangeEvent = UserPasswordChangedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: userId,
      payload: {
        hashedPassword: "new_hashed_password",
      },
      version: 2,
    });

    const updatedUser = UserProjector.project(
      passwordChangeEvent,
      user,
    ).unwrapOrThrow();

    expect(updatedUser).toEqual({
      id: userId,
      firstName: "Alice",
      lastName: "Johnson",
      email: "alice.johnson@example.com",
      hashedPassword: "new_hashed_password",
      role: UserRole.ADMIN,
      invitedBy,
      version: 2,
      updatedAt: passwordChangeEvent.timestamp,
      createdAt: user.createdAt,
    });
  });
});
