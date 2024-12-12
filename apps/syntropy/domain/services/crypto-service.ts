import { Effect, TaggedError } from "@fabric/core";

export interface CryptoService {
  hashPassword(password: string): Effect<string, InvalidPrivateKeyError>;
  verifyPassword(
    password: string,
    hash: string,
  ): Effect<void, InvalidPasswordError | InvalidPrivateKeyError>;
}

export class InvalidPasswordError extends TaggedError<"InvalidPasswordError"> {
  constructor() {
    super(
      "InvalidPasswordError",
      "The password is invalid or was not provided.",
    );
  }
}

export class InvalidPrivateKeyError
  extends TaggedError<"InvalidPrivateKeyError"> {
  constructor() {
    super(
      "InvalidPrivateKeyError",
      "The private key is invalid or was not provided.",
    );
  }
}
