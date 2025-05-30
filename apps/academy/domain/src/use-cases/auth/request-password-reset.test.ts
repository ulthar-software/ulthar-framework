import { PosixDate, SchemaParsingError } from "@fabric/core";
import { beforeEach, describe, expect, test } from "@fabric/testing";
import type { MockedDependencies } from "../../mocks.js";
import { createServiceMocks } from "../../mocks.js";
import { createUserMock } from "../../models/mocks/create-user-mock.js";
import type { User } from "../../models/user.js";
import {
  PasswordResetTokenExpirationTime,
  RequestPasswordResetUseCase,
} from "./request-password-reset.js";

describe("Request Password Use Case", () => {
  let services: MockedDependencies;
  let user: User;

  beforeEach(async () => {
    services = await createServiceMocks();
    user = await createUserMock(services, { role: "ADMIN" });
  });

  test("Requesting a password change should work", async () => {
    await RequestPasswordResetUseCase.call(
      { ...services, currentUser: undefined },
      { email: user.email },
    ).runOrThrow();

    const updatedUser = await services.state
      .from("passwordResets")
      .where({ email: user.email })
      .selectOneOrFail()
      .runOrThrow();

    expect(updatedUser.token).toEqual(expect.any(String));
    expect(updatedUser.expiresAt.timestamp).toBeLessThanOrEqual(
      PosixDate.now().add(PasswordResetTokenExpirationTime).timestamp,
    );
  });

  test("Requesting a password reset for non-existent user should complete without error", async () => {
    const nonExistentEmail = "nonexistent@example.com";

    // Should not throw an error
    await RequestPasswordResetUseCase.call(
      { ...services, currentUser: undefined },
      { email: nonExistentEmail },
    ).runOrThrow();

    // Should not create any password reset record
    const resetRequest = await services.state
      .from("passwordResets")
      .where({ email: nonExistentEmail })
      .selectOne()
      .runOrThrow();

    expect(resetRequest.isValue()).toBe(false);
  });

  test("Invalid email format should throw validation error", async () => {
    const result = await RequestPasswordResetUseCase.call(
      { ...services, currentUser: undefined },
      { email: "invalid-email" },
    ).run();

    expect(result.isError()).toBe(true);
    // Should be a schema parsing error due to invalid email format
    if (result.isError()) {
      expect(result.value).toBeInstanceOf(SchemaParsingError);
    }
  });

  test("Missing email should throw validation error", async () => {
    const result = await RequestPasswordResetUseCase.call(
      { ...services, currentUser: undefined },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {} as any,
    ).run();

    expect(result.isError()).toBe(true);
    // Should be a schema parsing error due to missing required field
    if (result.isError()) {
      expect(result.value).toBeInstanceOf(SchemaParsingError);
    }
  });
});
