import type { CryptoService } from "@fabric/core";
import { Effect, InvalidPasswordError, Result } from "@fabric/core";
import crypto, { type UUID } from "node:crypto";

export class CryptoServiceMock implements CryptoService {
  randomUUID(): UUID {
    return crypto.randomUUID();
  }

  hashPassword(password: string): Effect<string> {
    return Effect.from(() => {
      return `%%${password}%%`;
    });
  }

  verifyPassword(
    password: string,
    hash: string,
  ): Effect<void, InvalidPasswordError> {
    return Effect.fromResult(() => {
      if (hash === `%%${password}%%`) {
        return Result.ok();
      }
      return Result.failWith(new InvalidPasswordError());
    });
  }

  generateRandomToken(size: number): string {
    return crypto.randomBytes(size).toString("hex");
  }
}
