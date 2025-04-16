import type { InvalidPrivateKeyError } from "@fabric/core";
import { Effect, InvalidPasswordError, Result } from "@fabric/core";
import crypto, { type UUID } from "node:crypto";
import { type DomainCryptoService } from "../crypto-service.js";

export class CryptoServiceMock implements DomainCryptoService {
  randomUUID(): UUID {
    return crypto.randomUUID();
  }

  hashPassword(password: string): Effect<string, InvalidPrivateKeyError> {
    return Effect.from(() => {
      return `%%${password}%%`;
    });
  }

  verifyPassword(
    password: string,
    hash: string,
  ): Effect<void, InvalidPasswordError | InvalidPrivateKeyError> {
    return Effect.fromResult(() => {
      if (hash === `%%${password}%%`) {
        return Result.ok();
      }
      return Result.failWith(new InvalidPasswordError());
    });
  }

  generateInviteCode(): string {
    return crypto.randomBytes(4).toString("hex");
  }
}
