import type { Effect } from "../../effect/effect.js";
import { TaggedError } from "../../error/tagged-error.js";
import type { UnexpectedError } from "../../error/unexpected-error.js";
import type { UUID } from "../../types/uuid.js";

export interface CryptoService {
  hashPassword(password: string): Effect<string, UnexpectedError>;
  verifyPassword(
    password: string,
    hash: string,
  ): Effect<void, InvalidPasswordError | UnexpectedError>;
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
