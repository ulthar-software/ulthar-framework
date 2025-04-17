import type { UUID } from "@fabric/core";
import { Effect, JSONExt } from "@fabric/core";
import type { User } from "../../models/user.js";
import {
  getPermissionsForRole,
  type Permission,
} from "../../security/permission.js";
import type {
  AuthService,
  ExpiredTokenError,
  UserAccess,
} from "../auth-service.js";
import { InvalidTokenError } from "../auth-service.js";

export class AuthServiceMock implements AuthService {
  generateAccessToken(user: User): Effect<string> {
    return Effect.ok(
      `${user.id}-${user.role}-${JSONExt.stringify(getPermissionsForRole(user.role)).unwrapOrThrow()}`,
    );
  }

  validateAccessToken(
    token: string,
  ): Effect<UserAccess, InvalidTokenError | ExpiredTokenError> {
    try {
      const userId = token.split("-")[0];
      const permissions = JSONExt.parse<Permission[]>(
        token.split("-")[2],
      ).unwrapOrThrow();

      const userAccess: UserAccess = {
        id: userId as UUID,
        permissions: permissions,
      };

      return Effect.ok(userAccess);
    } catch {
      return Effect.failWith(new InvalidTokenError());
    }
  }
}
