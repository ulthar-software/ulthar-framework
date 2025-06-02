import type {
  CryptoService,
  NotFoundError,
  UnexpectedError,
} from "@fabric/core";
import { Effect, Field, Schema, type Infer } from "@fabric/core";
import {
  UserInvitedEvent,
  UserInviteRemovedEvent,
} from "../../models/user-invite.js";
import { AccessPolicy } from "../../security/access-policy.js";
import { Permission } from "../../security/permission.js";
import type { UserAccess } from "../../services/auth-service.js";
import type { DomainEventStore } from "../../services/event-store.js";
import type { DomainStateStore } from "../../services/state-store.js";
import { UseCase } from "../../utils/use-case.js";

// Input model for the invite user use case
export const ResendInviteInputModel = new Schema({
  inviteId: Field.uuid(),
});
export type ResendInviteInput = Infer<typeof ResendInviteInputModel>;

// Dependencies needed for the invite user use case
export interface ResendInviteDependencies {
  state: DomainStateStore;
  events: DomainEventStore;
  crypto: CryptoService;
  currentUser: UserAccess;
}

// Define the use case
export const ResendInviteUseCase = new UseCase({
  name: "resendInvite",
  type: "command",
  auth: AccessPolicy.WithPermission(Permission.INVITE_USERS),
  inputSchema: ResendInviteInputModel,
  effect: (
    { state, events, crypto, currentUser }: ResendInviteDependencies,
    { inviteId }: ResendInviteInput,
  ): Effect<void, UnexpectedError | NotFoundError> => {
    return Effect.fromGen(function* () {
      // Check if the user is already invited
      const existingInvite = yield* state
        .from("userInvites")
        .where({ id: inviteId })
        .selectOneOrFail();

      yield* events.append(
        "userInvites",
        UserInviteRemovedEvent.from({
          id: crypto.randomUUID(),
          streamId: existingInvite.id,
          payload: {
            removedBy: currentUser.id,
          },
          version: existingInvite.version + 1,
        }),
      );

      // If the user is already invited, resend the invitation
      const event = UserInvitedEvent.from({
        id: crypto.randomUUID(),
        streamId: crypto.randomUUID(),
        payload: {
          email: existingInvite.email,
          role: existingInvite.role,
          code: existingInvite.code,
        },
        version: 1,
      });

      yield* events.append("userInvites", event);
    });
  },
});
