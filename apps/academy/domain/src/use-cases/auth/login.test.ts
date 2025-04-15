/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { beforeEach, describe, expect, test } from "@fabric/testing";
import { createUserMock } from "../../models/mocks/create-user-mock.js";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../../services/mocks/create-mock-services.js";
import { LoginUseCase } from "./login.js";

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

    const result = await LoginUseCase.call(undefined, services, {
      email: testingEmail,
      password: testingPassword,
    }).runOrThrow();

    expect(result).toEqual({
      accessToken: expect.any(String),
    });
  });
});
