import { PosixDate, WritableValueStore } from "@fabric/core";
import { AuthServiceMock, CryptoServiceMock } from "@fabric/core/mocks";
import { SQLiteStoreDriver } from "@fabric/sqlite-store";
import { beforeEach, describe, expect, test } from "@fabric/testing";
import { DomainModels } from "../../models/index.js";
import type { User } from "../../models/user.js";
import { UserType } from "../../security/users.js";
import login, { InvalidCredentialsError } from "./login.js";

describe("Login Use Case", async () => {
  let state: WritableValueStore<DomainModels>;
  const crypto = new CryptoServiceMock();
  const auth = new AuthServiceMock();
  const userId = crypto.randomUUID();
  const validPassword = "correctPassword";

  const testUser: User = {
    id: userId,
    email: "valid@example.com",
    firstName: "Jane",
    lastName: "Doe",
    createdAt: new PosixDate(),
    updatedAt: new PosixDate(),
    version: 1,
    hashedPassword: (
      await crypto.hashPassword(validPassword).run()
    ).unwrapOrThrow(),
    role: UserType.ADMIN,
  };

  beforeEach(async () => {
    state = new WritableValueStore(
      new SQLiteStoreDriver(":memory:"),
      DomainModels,
    );

    await state.sync().run();

    await state.insertInto("users").value(testUser).run();
  });
  test("Should fail on invalid credentials", async () => {
    const result = await login
      .useCase(
        { state, crypto, auth },
        { email: "invalid@example.com", password: "wrongPassword" },
      )
      .run();

    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(InvalidCredentialsError);
  });

  test("Should succeed on valid credentials", async () => {
    const result = await login
      .useCase(
        { state, crypto, auth },
        { email: testUser.email, password: validPassword },
      )
      .run();

    expect(result.unwrapOrThrow()).toEqual({
      accessToken: auth.generateAccessToken(testUser),
      refreshToken: auth.generateRefreshToken(testUser),
    });
  });
});
