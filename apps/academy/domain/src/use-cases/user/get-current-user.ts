import { Effect, TaggedError, UnexpectedError } from "@fabric/core";
import type { User } from "../../models/user.js";
import { AccessPolicy } from "../../security/access-policy.js";
import type { UserAccess } from "../../services/auth-service.js";
import type { DomainStateStore } from "../../services/state-store.js";
import { UseCase } from "../../utils/use-case.js";

// Dependencies needed for the get current user use case
export interface GetCurrentUserDependencies {
  state: DomainStateStore;
  currentUser: UserAccess;
}

// Custom error for the get current user use case
export class UserNotFoundError extends TaggedError<"UserNotFoundError"> {
  constructor(userId: string) {
    super("UserNotFoundError", `User with ID ${userId} not found`);
    this.name = "UserNotFoundError";
  }
}

// Output model for the get current user use case
export interface GetCurrentUserOutput {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

// Define the use case
export const GetCurrentUserUseCase = new UseCase({
  name: "getCurrentUser",
  type: "query",
  auth: AccessPolicy.Authenticated(),
  effect: ({
    state,
    currentUser,
  }: GetCurrentUserDependencies): Effect<
    GetCurrentUserOutput,
    UserNotFoundError | UnexpectedError
  > => {
    return Effect.fromGen(function* () {
      // Get the user ID from the current user
      const userId = currentUser.id;

      // Get the user from the state store
      const userMaybe = yield* state
        .from("users")
        .where({ id: userId })
        .selectOne()
        .mapError((e) => new UnexpectedError(e.message));

      if (userMaybe.isNothing()) {
        throw new UserNotFoundError(userId);
      }

      const user = userMaybe.value as User;

      // Return the user information (excluding sensitive data like hashedPassword)
      return {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      };
    });
  },
});
