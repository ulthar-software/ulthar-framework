import { TaggedError } from "@fabric/core";
import type { Query } from "@fabric/domain";
import { Field, Model, type ModelToType } from "@fabric/models";
import type { AuthService } from "../../services/auth-service.js";
import type { CryptoService } from "../../services/crypto-service.js";
import type { ReadValueStore } from "../../services/state-store.js";
export interface LoginDependencies {
  state: ReadValueStore;
  crypto: CryptoService;
  auth: AuthService;
}

export const LoginRequestModel = new Model("LoginRequestModel", {
  email: Field.email({}),
  password: Field.string({}),
  rememberMe: Field.boolean({ isOptional: true }),
});
export type LoginRequestModel = ModelToType<typeof LoginRequestModel>;

export const LoginResponseModel = new Model("LoginResponseModel", {
  accessToken: Field.string({}),
  refreshToken: Field.string({}),
});
export type LoginResponseModel = ModelToType<typeof LoginResponseModel>;

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
} as const satisfies Query<
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
