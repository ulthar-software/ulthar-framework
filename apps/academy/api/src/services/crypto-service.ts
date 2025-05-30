import type { CryptoService, UUID } from "@fabric/core";
import { Effect, InvalidPasswordError, UnexpectedError } from "@fabric/core";
import bcrypt from "bcrypt";
import crypto from "node:crypto";

export class ConcreteCryptoService implements CryptoService {
  hashPassword(password: string): Effect<string, UnexpectedError> {
    return Effect.tryFrom(
      async () => {
        return await bcrypt.hash(password, 12);
      },
      (e: Error) => new UnexpectedError(e.message),
    );
  }
  verifyPassword(
    password: string,
    hash: string,
  ): Effect<void, InvalidPasswordError | UnexpectedError> {
    return Effect.tryFrom(
      async () => {
        if (await bcrypt.compare(password, hash)) {
          return;
        } else {
          throw new Error("Invalid password");
        }
      },
      () => new InvalidPasswordError(),
    );
  }
  randomUUID(): UUID {
    return crypto.randomUUID();
  }

  generateRandomToken(size: number): string {
    return crypto.randomBytes(size).toString("hex");
  }
}
