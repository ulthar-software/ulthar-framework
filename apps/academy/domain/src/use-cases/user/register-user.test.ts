/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { type Email, type UUID } from "@fabric/core";
import { beforeEach, describe, expect, test } from "@fabric/testing";
import { createUserMock } from "../../models/mocks/create-user-mock.js";
import { UserInvitedEvent } from "../../models/user-invite.js";
import { UserRole } from "../../security/user-role.js";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../../services/mocks/create-mock-services.js";
import { UserAlreadyExistsError } from "./invite-user.js";
import {
  InvalidInviteCodeError,
  RegisterUserUseCase,
} from "./register-user.js";

describe("Register User Use Case", () => {
  let services: MockedDependencies;
  let validInviteCode: string;
  let validInviteEmail: Email;
  let validInviteId: UUID;

  beforeEach(async () => {
    services = await createServiceMocks();

    // Create a valid invitation that can be used for tests
    validInviteEmail = "newuser@example.com";
    validInviteCode = services.crypto.generateRandomToken(4);
    validInviteId = services.crypto.randomUUID();

    const inviteEvent = UserInvitedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: validInviteId,
      version: 1,
      payload: {
        email: validInviteEmail,
        role: UserRole.STUDENT,
        code: validInviteCode,
      },
    });

    await services.events.append("userInvites", inviteEvent).runOrThrow();
  });

  test("Should successfully register a user with valid invite code", async () => {
    // Arrange
    const testingFirstName = "John";
    const testingLastName = "Doe";
    const testingPassword = "securePassword123";

    // Act
    const result = await RegisterUserUseCase.call(
      {
        ...services,
        currentUser: undefined,
      },
      {
        firstName: testingFirstName,
        lastName: testingLastName,
        email: validInviteEmail,
        password: testingPassword,
        inviteCode: validInviteCode,
      },
    ).runOrThrow();

    // Assert
    expect(result).toEqual({
      userId: expect.any(String),
    });

    // Verify user was created in the database
    const userInDb = await services.state
      .from("users")
      .where({ email: validInviteEmail })
      .selectOneOrFail()
      .runOrThrow();

    expect(userInDb).toEqual(
      expect.objectContaining({
        firstName: testingFirstName,
        lastName: testingLastName,
        email: validInviteEmail,
        role: UserRole.STUDENT,
        hashedPassword: expect.any(String),
      }),
    );

    // Verify the invitation is now marked as used (should not be found in DB)
    const inviteQuery = await services.state
      .from("userInvites")
      .where({ id: validInviteId })
      .selectOne()
      .runOrThrow();

    // The UserInviteAcceptedEvent causes the projector to return null
    expect(inviteQuery.isNothing()).toBe(true);
  });

  test("Should fail when trying to register with an invalid invite code", async () => {
    // Act
    const result = await RegisterUserUseCase.call(
      {
        ...services,
        currentUser: undefined,
      },
      {
        firstName: "Invalid",
        lastName: "User",
        email: validInviteEmail,
        password: "password123",
        inviteCode: "invalid-code", // Invalid code
      },
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    const error = result.unwrapErrorOrThrow();
    expect(error).toBeInstanceOf(InvalidInviteCodeError);
  });

  test("Should fail when trying to register with a mismatched email and invite code", async () => {
    // Act
    const result = await RegisterUserUseCase.call(
      {
        ...services,
        currentUser: undefined,
      },
      {
        firstName: "Mismatch",
        lastName: "User",
        email: "different@example.com", // Different from invitation
        password: "password123",
        inviteCode: validInviteCode,
      },
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    const error = result.unwrapErrorOrThrow();
    expect(error).toBeInstanceOf(InvalidInviteCodeError);
  });

  test("Should fail when trying to register with an email that already exists", async () => {
    // Arrange - Create a user first
    const existingEmail = "existing@example.com";
    await createUserMock(services, {
      email: existingEmail,
    });

    // Create a valid invitation for the already registered email
    const inviteCode = services.crypto.generateRandomToken(4);
    const inviteId = services.crypto.randomUUID();

    const inviteEvent = UserInvitedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: inviteId,
      version: 1,
      payload: {
        email: existingEmail,
        role: UserRole.STUDENT,
        code: inviteCode,
      },
    });

    await services.events.append("userInvites", inviteEvent).runOrThrow();

    // Act
    const result = await RegisterUserUseCase.call(
      {
        ...services,
        currentUser: undefined,
      },
      {
        firstName: "Duplicate",
        lastName: "User",
        email: existingEmail,
        password: "password123",
        inviteCode: inviteCode,
      },
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    const error = result.unwrapErrorOrThrow();
    expect(error).toBeInstanceOf(UserAlreadyExistsError);
  });

  test("Should register users with different roles based on invitation", async () => {
    // Create a teacher invitation
    const teacherEmail = "teacher@example.com";
    const teacherInviteCode = services.crypto.generateRandomToken(4);
    const teacherInviteId = services.crypto.randomUUID();

    const teacherInviteEvent = UserInvitedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: teacherInviteId,
      version: 1,
      payload: {
        email: teacherEmail,
        role: UserRole.TEACHER,
        code: teacherInviteCode,
      },
    });

    await services.events
      .append("userInvites", teacherInviteEvent)
      .runOrThrow();

    // Register as teacher
    await RegisterUserUseCase.call(
      {
        ...services,
        currentUser: undefined,
      },
      {
        firstName: "Teacher",
        lastName: "User",
        email: teacherEmail,
        password: "teacher123",
        inviteCode: teacherInviteCode,
      },
    ).runOrThrow();

    // Verify teacher role was assigned
    const teacherInDb = await services.state
      .from("users")
      .where({ email: teacherEmail })
      .selectOneOrFail()
      .runOrThrow();

    expect(teacherInDb.role).toBe(UserRole.TEACHER);
  });
});
