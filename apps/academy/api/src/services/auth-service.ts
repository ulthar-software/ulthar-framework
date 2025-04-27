import { Effect, UnexpectedError } from "@fabric/core";
import {
  ExpiredTokenError,
  getPermissionsForRole,
  InvalidTokenError,
  type AuthService,
  type User,
  type UserAccess,
} from "@ulthar/academy-domain";

import jwt from "jsonwebtoken";

export class ConcreteAuthService implements AuthService {
  constructor(private readonly jwtSecret: string) {}

  generateAccessToken(user: User): Effect<string, UnexpectedError> {
    return Effect.tryFrom(
      () =>
        new Promise((resolve, reject) => {
          jwt.sign(
            {
              id: user.id,
              permissions: getPermissionsForRole(user.role),
            } as UserAccess,
            this.jwtSecret,
            { expiresIn: "7d" },
            (err, token) => {
              if (err) {
                reject(new UnexpectedError());
              } else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                resolve(token!);
              }
            },
          );
        }),
      (e: Error) => new UnexpectedError(e.message),
    );
  }

  validateAccessToken(
    token: string,
  ): Effect<UserAccess, InvalidTokenError | ExpiredTokenError> {
    return Effect.tryFrom(
      () =>
        new Promise((resolve, reject) => {
          jwt.verify(token, this.jwtSecret, (err, decoded) => {
            if (err) {
              if (err.name === "TokenExpiredError") {
                reject(new ExpiredTokenError(err.message));
              } else {
                reject(new InvalidTokenError(err.message));
              }
            } else {
              resolve(decoded as UserAccess);
            }
          });
        }),
      (e: Error) => new InvalidTokenError(e.message),
    );
  }
}
