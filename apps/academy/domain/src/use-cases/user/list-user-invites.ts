import type { StoreReadQuery, UnexpectedError } from "@fabric/core";
import { Effect, Field, isLike, Schema, type Infer } from "@fabric/core";
import type { UserInvite } from "../../models/user-invite.js";
import { AccessPolicy } from "../../security/access-policy.js";
import { Permission } from "../../security/permission.js";
import type { DomainStateStore } from "../../services/state-store.js";
import { UseCase } from "../../utils/use-case.js";

// Input model for the list user invitations use case
export const ListUserInvitationsInputModel = new Schema({
  page: Field.integer({ isOptional: true }),
  pageSize: Field.integer({ isOptional: true }),
  filter: Field.string({ isOptional: true }),
});
export type ListUserInvitationsInput = Infer<
  typeof ListUserInvitationsInputModel
>;

// Dependencies needed for the list user invitations use case
export interface ListUserInvitationsDependencies {
  state: DomainStateStore;
}

// Output model for the list user invitations use case
export interface ListUserInvitationsOutput {
  invitations: {
    id: string;
    email: string;
    role: string;
  }[];
}

// Define the use case
export const ListUserInvitesUseCase = new UseCase({
  name: "listUserInvites",
  type: "query",
  auth: AccessPolicy.WithPermission(Permission.LIST_USERS),
  inputSchema: ListUserInvitationsInputModel,
  effect: (
    { state }: ListUserInvitationsDependencies,
    { page = 1, pageSize = 10, filter }: ListUserInvitationsInput,
  ): Effect<ListUserInvitationsOutput, UnexpectedError> => {
    return Effect.fromGen(function* () {
      const offset = (page - 1) * pageSize;

      let invitationsQuery: StoreReadQuery<UserInvite> =
        state.from("userInvites");

      if (filter) {
        invitationsQuery = invitationsQuery.where([
          { email: isLike(`%${filter}%`) },
        ]) as StoreReadQuery<UserInvite>;
      }

      const invitations = yield* invitationsQuery
        .limit(pageSize, offset)
        .select(["id", "email", "role"]);

      return { invitations };
    });
  },
});
