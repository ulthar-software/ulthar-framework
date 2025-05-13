import type { StoreReadQuery, UnexpectedError } from "@fabric/core";
import { Effect, Field, isLike, Schema, type Infer } from "@fabric/core";
import type { UserInvite } from "../../models/user-invite.js";
import { AccessPolicy } from "../../security/access-policy.js";
import { Permission } from "../../security/permission.js";
import type { DomainStateStore } from "../../services/state-store.js";
import { UseCase } from "../../utils/use-case.js";

// Input model for the list user invitations use case
export const ListUserInvitesInputModel = new Schema({
  page: Field.integer({ isOptional: true }),
  pageSize: Field.integer({ isOptional: true }),
  filter: Field.string({ isOptional: true }),
});
export type ListUserInvitesInput = Infer<typeof ListUserInvitesInputModel>;

// Dependencies needed for the list user invitations use case
export interface ListUserInvitesDependencies {
  state: DomainStateStore;
}

// Output model for the list user invitations use case
export interface ListUserInvitesOutput {
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
  inputSchema: ListUserInvitesInputModel,
  effect: (
    { state }: ListUserInvitesDependencies,
    { page = 1, pageSize = 10, filter }: ListUserInvitesInput,
  ): Effect<ListUserInvitesOutput, UnexpectedError> => {
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
