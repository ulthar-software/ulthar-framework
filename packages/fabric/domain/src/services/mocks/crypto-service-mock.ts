import { Effect, type UUID } from "@fabric/core";
import crypto from "node:crypto";
import {
  InvalidPasswordError,
  type CryptoService,
  type InvalidPrivateKeyError,
} from "../crypto-service.js";

export class CryptoServiceMock implements CryptoService {
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
}
