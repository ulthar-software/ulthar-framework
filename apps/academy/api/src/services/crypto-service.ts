import type { UUID } from "@fabric/core";
import { Effect, InvalidPasswordError, UnexpectedError } from "@fabric/core";
import type { DomainCryptoService } from "@ulthar/academy-domain";
import bcrypt from "bcrypt";
import crypto from "node:crypto";

export class ConcreteCryptoService implements DomainCryptoService {
  generateInviteCode(): string {
    return crypto.randomBytes(4).toString("hex");
  }
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
}
