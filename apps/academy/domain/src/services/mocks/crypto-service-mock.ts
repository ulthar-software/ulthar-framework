import type { InvalidPrivateKeyError } from "@fabric/core";
import { Effect, InvalidPasswordError } from "@fabric/core";
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
    return Effect.from(() => {
      if (hash === `%%${password}%%`) {
        return;
      }
      throw new InvalidPasswordError();
    });
  }

  generateInviteCode(): string {
    return crypto.randomBytes(16).toString("hex");
  }
}
