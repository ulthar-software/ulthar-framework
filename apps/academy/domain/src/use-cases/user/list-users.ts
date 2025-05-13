import type {
  Email,
  StoreReadQuery,
  UnexpectedError,
  UUID,
} from "@fabric/core";
import { Effect, Field, isLike, Schema, type Infer } from "@fabric/core";
import type { User } from "../../models/user.js";
import { AccessPolicy } from "../../security/access-policy.js";
import type { UserRole } from "../../security/user-role.js";
import type { DomainStateStore } from "../../services/state-store.js";
import { UseCase } from "../../utils/use-case.js";

// Input model for the list users use case
export const ListUsersInputModel = new Schema({
  page: Field.integer({ isOptional: true }),
  pageSize: Field.integer({ isOptional: true }),
  filter: Field.string({ isOptional: true }),
});
export type ListUsersInput = Infer<typeof ListUsersInputModel>;

// Dependencies needed for the list users use case
export interface ListUsersDependencies {
  state: DomainStateStore;
}

// Output model for the list users use case
export interface ListUsersOutput {
  users: {
    id: UUID;
    firstName: string;
    lastName: string;
    email: Email;
    role: UserRole;
  }[];
}

// Define the use case
export const ListUsersUseCase = new UseCase({
  name: "listUsers",
  type: "query",
  auth: AccessPolicy.WithPermission("LIST_USERS"),
  inputSchema: ListUsersInputModel,
  effect: (
    { state }: ListUsersDependencies,
    { page = 1, pageSize = 10, filter }: ListUsersInput,
  ): Effect<ListUsersOutput, UnexpectedError> => {
    return Effect.fromGen(function* () {
      const offset = (page - 1) * pageSize;

      let usersQuery: StoreReadQuery<User> = state.from("users");

      if (filter) {
        usersQuery = usersQuery.where([
          { firstName: isLike(`%${filter}%`) },
          { lastName: isLike(`%${filter}%`) },
          { email: isLike(`%${filter}%`) },
        ]) as StoreReadQuery<User>;
      }

      const users = yield* usersQuery
        .limit(pageSize, offset)
        .select(["id", "firstName", "lastName", "email", "role"]);

      return { users };
    });
  },
});
