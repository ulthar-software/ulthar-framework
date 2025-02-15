import type { Effect } from "../../effect/effect.js";
import { TaggedError } from "../../error/tagged-error.js";
import type { UUID } from "../../types/uuid.js";

export interface CryptoService {
  hashPassword(password: string): Effect<string, InvalidPrivateKeyError>;
  verifyPassword(
    password: string,
    hash: string,
  ): Effect<void, InvalidPasswordError | InvalidPrivateKeyError>;
  randomUUID(): UUID;
}

export class InvalidPasswordError extends TaggedError<"InvalidPasswordError"> {
  constructor() {
    super(
      "InvalidPasswordError",
      "The password is invalid or was not provided.",
    );
  }
}

export class InvalidPrivateKeyError extends TaggedError<"InvalidPrivateKeyError"> {
  constructor() {
    super(
      "InvalidPrivateKeyError",
      "The private key is invalid or was not provided.",
    );
  }
}
