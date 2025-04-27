import crypto, { type UUID } from "node:crypto";
import { Effect } from "../../../effect/effect.js";
import { InvalidPasswordError, type CryptoService } from "../crypto-service.js";

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
    return Effect.from(() => {
      if (hash === `%%${password}%%`) {
        return;
      }
      throw new InvalidPasswordError();
    });
  }
}
