import { type AsyncResult, TaggedError } from "@fabric/core";

export interface CryptoService {
  hashPassword(password: string): AsyncResult<string, InvalidPrivateKeyError>;
  verifyPassword(
    password: string,
    hash: string,
  ): AsyncResult<void, InvalidPasswordError | InvalidPrivateKeyError>;
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
