/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { SchemaParsingError } from "@fabric/core";
import { beforeEach, describe, expect, test } from "@fabric/testing";
import { createUserMock } from "../../models/mocks/create-user-mock.js";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../../services/mocks/create-mock-services.js";
import { InvalidCredentialsError, LoginUseCase } from "./login.js";

describe("Login Use Case", () => {
  let services: MockedDependencies;

  beforeEach(async () => {
    services = await createServiceMocks();
  });

  test("Should succeed on valid credentials", async () => {
    const testingEmail = "test@example.com";
    const testingPassword = "password123";

    await createUserMock(services, {
      email: testingEmail,
      password: testingPassword,
    });

    const result = await LoginUseCase.call(
      {
        ...services,
        currentUser: undefined,
      },
      {
        email: testingEmail,
        password: testingPassword,
      },
    ).runOrThrow();

    expect(result).toEqual({
      accessToken: expect.any(String),
    });
  });

  test("Should fail with InvalidCredentialsError when password is incorrect", async () => {
    // Arrange
    const testingEmail = "test@example.com";
    const correctPassword = "correctPassword";
    const wrongPassword = "wrongPassword";

    await createUserMock(services, {
      email: testingEmail,
      password: correctPassword,
    });

    // Act
    const result = await LoginUseCase.call(
      {
        ...services,
        currentUser: undefined,
      },
      {
        email: testingEmail,
        password: wrongPassword,
      },
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    const error = result.unwrapErrorOrThrow();
    expect(error).toBeInstanceOf(InvalidCredentialsError);
  });

  test("Should fail with InvalidCredentialsError when user doesn't exist", async () => {
    // Arrange
    const nonExistentEmail = "nonexistent@example.com";
    const password = "anyPassword";

    // Act
    const result = await LoginUseCase.call(
      {
        ...services,
        currentUser: undefined,
      },
      {
        email: nonExistentEmail,
        password,
      },
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    const error = result.unwrapErrorOrThrow();
    expect(error).toBeInstanceOf(InvalidCredentialsError);
  });

  test("Should validate email format", async () => {
    // Arrange
    const invalidEmail = "not-an-email";
    const password = "anyPassword";

    // Act
    const result = await LoginUseCase.call(
      {
        ...services,
        currentUser: undefined,
      },
      {
        email: invalidEmail,
        password,
      },
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    const error = result.unwrapErrorOrThrow();
    // Should be a schema parsing error
    expect(error).toBeInstanceOf(SchemaParsingError);
  });
});
