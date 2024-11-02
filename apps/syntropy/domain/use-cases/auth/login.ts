import { TaggedError } from "@fabric/core";
import { Field, Model, type ModelToType, type Query } from "@fabric/domain";
import type { AuthService } from "../../services/auth-service.ts";
import type { CryptoService } from "../../services/crypto-service.ts";
import type { ReadStateStore } from "../../services/state-store.ts";

export interface LoginDependencies {
  state: ReadStateStore;
  crypto: CryptoService;
  auth: AuthService;
}

export const LoginRequestModel = Model.from("LoginRequestModel", {
  email: Field.email(),
  password: Field.string(),
  rememberMe: Field.boolean({ isOptional: true }),
});
export type LoginRequestModel = ModelToType<typeof LoginRequestModel>;

export const LoginResponseModel = Model.from("LoginResponseModel", {
  accessToken: Field.string(),
  refreshToken: Field.string(),
});
export type LoginResponseModel = ModelToType<typeof LoginResponseModel>;

export type LoginErrors = InvalidCredentialsError;

export default {
  name: "login",
  isAuthRequired: false,
  useCase: ({ state, crypto, auth }, { email, password }) =>
    state.from("users")
      .where({
        email,
      })
      .selectOneOrFail()
      .assert((user) => crypto.verifyPassword(password, user.hashedPassword))
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

export class InvalidCredentialsError
  extends TaggedError<"InvalidCredentialsError"> {
  constructor() {
    super("InvalidCredentialsError");
  }
}
