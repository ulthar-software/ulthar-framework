import { type UUID } from "@fabric/core";
import {
  beforeEach,
  describe,
  expect,
  fnMock,
  it,
  partialMock,
} from "@fabric/testing";
import type { Logger, User } from "@ulthar/academy-domain";
import { getPermissionsForRole } from "@ulthar/academy-domain";
import { ConcreteAuthService } from "../services/auth-service.js";
import {
  parseAccessToken,
  type AuthDependencies,
} from "./parse-access-token.js";

describe("parseAccessToken", () => {
  let deps: AuthDependencies;

  beforeEach(() => {
    deps = {
      logger: partialMock<Logger>({
        error: fnMock(),
      }),
      auth: new ConcreteAuthService("los gatitos son lo mejor"),
    };
  });

  it("should successfully parse a valid token", async () => {
    // Mock valid token with user ID and permissions
    const user: User = partialMock<User>({
      id: "user-id" as UUID,
      role: "ADMIN",
    });
    const mockToken = await deps.auth.generateAccessToken(user).runOrThrow();

    const result = await parseAccessToken(deps, mockToken);

    // Verify the function returns the expected user access object
    expect(result).toBeDefined();
    expect(result?.id).toBe(user.id);
    expect(result?.permissions).toEqual(getPermissionsForRole("ADMIN"));
  });

  it("should return undefined when token is undefined", async () => {
    const result = await parseAccessToken(deps, undefined);

    expect(result).toBeUndefined();
  });

  it("should return undefined when token validation fails", async () => {
    const result = await parseAccessToken(deps, "invalid-token");
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(deps.logger.error).toHaveBeenCalledWith(
      `Tried parsing invalid token: invalid-token`,
    );
    expect(result).toBeUndefined();
  });
});
