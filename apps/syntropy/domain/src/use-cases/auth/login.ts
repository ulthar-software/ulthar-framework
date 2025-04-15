import type { AuthService, CryptoService } from "@fabric/core";
import { Field, Model, TaggedError, type Infer } from "@fabric/core";
import type { User } from "../../models/user.js";
import type { DomainStateStore } from "../../services/state-store.js";
import type { DomainQuery } from "../domain-query.js";
export interface LoginDependencies {
  state: DomainStateStore;
  crypto: CryptoService;
  auth: AuthService<User>;
}

export const LoginRequestModel = new Model("LoginRequestModel", {
  email: Field.email({}),
  password: Field.string({}),
});
export type LoginRequestModel = Infer<typeof LoginRequestModel>;

export const LoginResponseModel = new Model("LoginResponseModel", {
  accessToken: Field.string({}),
  refreshToken: Field.string({}),
});
export type LoginResponseModel = Infer<typeof LoginResponseModel>;

export type LoginErrors = InvalidCredentialsError;

export default {
  name: "login",
  isAuthRequired: false,
  useCase: ({ state, crypto, auth }, { email, password }) =>
    state
      .from("users")
      .where({
        email,
      })
      .selectOneOrFail()
      .assertOrFail((user) =>
        crypto.verifyPassword(password, user.hashedPassword),
      )
      .errorMap(() => new InvalidCredentialsError())
      .map((user) => ({
        accessToken: auth.generateAccessToken(user),
        refreshToken: auth.generateRefreshToken(user),
      })),
} as const satisfies DomainQuery<
  LoginDependencies,
  LoginRequestModel,
  LoginResponseModel,
  LoginErrors
>;

export class InvalidCredentialsError extends TaggedError<"InvalidCredentialsError"> {
  constructor() {
    super("InvalidCredentialsError");
  }
}
