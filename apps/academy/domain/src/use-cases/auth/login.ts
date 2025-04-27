import type { CryptoService, Infer } from "@fabric/core";
import { Field, Schema, TaggedError } from "@fabric/core";
import { AccessPolicy } from "../../security/access-policy.js";
import type { AuthService } from "../../services/auth-service.js";
import type { DomainStateStore } from "../../services/state-store.js";
import { UseCase } from "../../utils/use-case.js";

export const LoginInputModel = new Schema({
  email: Field.email(),
  password: Field.string(),
});

export type LoginInput = Infer<typeof LoginInputModel>;

export interface LoginOutput {
  accessToken: string;
}

export interface LoginDependencies {
  state: DomainStateStore;
  crypto: CryptoService;
  auth: AuthService;
}

export const LoginUseCase = new UseCase({
  name: "login",
  type: "query",
  auth: AccessPolicy.Anonymous(),
  inputSchema: LoginInputModel,
  effect: ({ state, crypto, auth }: LoginDependencies, input: LoginInput) =>
    state
      .from("users")
      .where({ email: input.email })
      .selectOneOrFail()
      .assertOrFail((user) =>
        crypto.verifyPassword(input.password, user.hashedPassword),
      )
      .errorMap(() => new InvalidCredentialsError())
      .flatMap((user) => auth.generateAccessToken(user))
      .map((accessToken) => ({
        accessToken,
      })),
});

export class InvalidCredentialsError extends TaggedError<"InvalidCredentialsError"> {
  constructor() {
    super("InvalidCredentialsError");
  }
}
