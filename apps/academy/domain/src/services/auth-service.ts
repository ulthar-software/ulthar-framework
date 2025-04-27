import type { Effect, UnexpectedError, UUID } from "@fabric/core";
import { TaggedError } from "@fabric/core";
import type { User } from "../models/user.js";
import type { Permission } from "../security/permission.js";

export interface UserAccess {
  id: UUID;
  permissions: Permission[];
}

export interface AuthService {
  /**
   * Generates an access token for the given user.
   * @param user The user for whom to generate the access token.
   * @returns An effect that resolves to the generated access token.
   */
  generateAccessToken(user: User): Effect<string, UnexpectedError>;

  /**
   * Validates the given access token.
   * @param token The access token to validate.
   * @returns An effect that resolves to a boolean indicating whether the token is valid.
   */
  validateAccessToken(
    token: string,
  ): Effect<UserAccess, InvalidTokenError | ExpiredTokenError>;
}

export class InvalidTokenError extends TaggedError<"InvalidTokenError"> {
  constructor(message?: string) {
    super("InvalidTokenError", message);
  }
}
export class ExpiredTokenError extends TaggedError<"ExpiredTokenError"> {
  constructor(message?: string) {
    super("ExpiredTokenError", message);
  }
}
