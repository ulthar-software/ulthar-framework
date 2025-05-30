import { minutes } from "@fabric/core";
import { beforeEach, describe, expect, test } from "@fabric/testing";
import type { MockedDependencies } from "../../mocks.js";
import { createServiceMocks } from "../../mocks.js";
import { createUserMock } from "../../models/mocks/create-user-mock.js";
import type { User } from "../../models/user.js";
import { PasswordResetUseCase } from "./password-reset.js";
import { RequestPasswordResetUseCase } from "./request-password-reset.js";

describe("Password Reset Use case", () => {
  let services: MockedDependencies;
  let user: User;

  beforeEach(async () => {
    services = await createServiceMocks();
    user = await createUserMock(services, { role: "ADMIN" });
  });

  test("After a request for a password reset, we can reset a user password", async () => {
    await RequestPasswordResetUseCase.call(
      { ...services, currentUser: undefined },
      { email: user.email },
    ).runOrThrow();

    const resetRequest = await services.state
      .from("passwordResets")
      .where({ email: user.email })
      .selectOneOrFail()
      .runOrThrow();

    services.time.advanceTime(minutes(5));

    await PasswordResetUseCase.call(
      { ...services, currentUser: undefined },
      {
        email: user.email,
        token: resetRequest.token,
        newPassword: "new-password",
      },
    ).runOrThrow();

    const updatedUser = await services.state
      .from("users")
      .where({ email: user.email })
      .selectOneOrFail()
      .runOrThrow();

    expect(updatedUser.hashedPassword).not.toEqual(user.hashedPassword);
    expect(updatedUser.hashedPassword).toContain("new-password"); //the mocked crypto service "hashes" the password by appending a string to it
  });
});
