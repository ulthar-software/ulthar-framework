import { hours, minutes } from "@fabric/core";
import { beforeEach, describe, expect, test } from "@fabric/testing";
import type { MockedDependencies } from "../../mocks.js";
import { createServiceMocks } from "../../mocks.js";
import { createUserMock } from "../../models/mocks/create-user-mock.js";
import type { User } from "../../models/user.js";
import { SystemAccess } from "../../services/auth-service.js";
import { ClearPasswordResetRequestUseCase } from "./clear-password-reset-requests.js";
import { RequestPasswordResetUseCase } from "./request-password-reset.js";

describe("Clear Password Reset Requests Use Case", () => {
  let services: MockedDependencies;
  let user: User;

  beforeEach(async () => {
    services = await createServiceMocks();
    user = await createUserMock(services, { role: "ADMIN" });
  });

  test("It should clear expired password reset requests", async () => {
    await RequestPasswordResetUseCase.call(
      { ...services, currentUser: undefined },
      { email: user.email },
    ).runOrThrow();

    services.time.advanceTime(hours(2));

    await ClearPasswordResetRequestUseCase.call(
      { ...services, currentUser: SystemAccess },
      {},
    ).runOrThrow();

    const passwordResetRequests = await services.state
      .from("passwordResets")
      .where({ email: user.email })
      .select()
      .runOrThrow();

    expect(passwordResetRequests).toHaveLength(0);
  });

  test("It should not clear non-expired password reset requests", async () => {
    await RequestPasswordResetUseCase.call(
      { ...services, currentUser: undefined },
      { email: user.email },
    ).runOrThrow();

    services.time.advanceTime(minutes(5));

    await ClearPasswordResetRequestUseCase.call(
      { ...services, currentUser: SystemAccess },
      {},
    ).runOrThrow();

    const passwordResetRequests = await services.state
      .from("passwordResets")
      .where({ email: user.email })
      .select()
      .runOrThrow();

    expect(passwordResetRequests).toHaveLength(1);
  });

  test("It should not fail if there are no expired requests", async () => {
    await ClearPasswordResetRequestUseCase.call(
      { ...services, currentUser: SystemAccess },
      {},
    ).runOrThrow();

    const passwordResetRequests = await services.state
      .from("passwordResets")
      .where({ email: user.email })
      .select()
      .runOrThrow();

    expect(passwordResetRequests).toHaveLength(0);
  });
});
