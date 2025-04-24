import { Field, Schema, TaggedError, type Infer } from "@fabric/core";
import { UserInvitedEvent } from "../../models/user-invite.js";
import { AccessPolicy } from "../../security/access-policy.js";
import { Permission } from "../../security/permission.js";
import { UserRole } from "../../security/user-role.js";
import type { DomainCryptoService } from "../../services/crypto-service.js";
import type { DomainEventStore } from "../../services/event-store.js";
import type { DomainStateStore } from "../../services/state-store.js";
import { UseCase } from "../../utils/use-case.js";

// Input model for the invite user use case
export const InviteUserInputModel = new Schema({
  email: Field.email(),
  role: Field.enum({
    values: Object.values(UserRole),
  }),
});

export type InviteUserInput = Infer<typeof InviteUserInputModel>;

// Dependencies needed for the invite user use case
export interface InviteUserDependencies {
  state: DomainStateStore;
  events: DomainEventStore;
  crypto: DomainCryptoService;
}

// Custom errors for the invite user use case
export class UserAlreadyInvitedError extends TaggedError<"UserAlreadyInvitedError"> {
  constructor(email: string) {
    super(
      "UserAlreadyInvitedError",
      `User with email ${email} has already been invited`,
    );
  }
}

export class UserAlreadyExistsError extends TaggedError<"UserAlreadyExistsError"> {
  constructor(email: string) {
    super("UserAlreadyExistsError", `User with email ${email} already exists`);
  }
}

// Define the use case
export const InviteUserUseCase = new UseCase({
  name: "inviteUser",
  type: "command",
  auth: AccessPolicy.WithPermission(Permission.INVITE_USERS),
  inputSchema: InviteUserInputModel,
  effect: (
    { state, events, crypto }: InviteUserDependencies,
    { email, role }: InviteUserInput,
  ) => {
    return state
      .from("users")
      .where({ email })
      .assertNone()
      .mapError(() => new UserAlreadyExistsError(email))
      .flatMap(() =>
        state
          .from("userInvites")
          .where({ email })
          .assertNone()
          .mapError(() => new UserAlreadyInvitedError(email)),
      )
      .flatMap(() => {
        const inviteCode = crypto.generateInviteCode();
        const id = crypto.randomUUID();

        const inviteEvent = UserInvitedEvent.from({
          id,
          streamId: id,
          version: 1,
          payload: {
            email,
            role,
            code: inviteCode,
          },
        });

        return events.append("userInvites", inviteEvent).map(() => undefined);
      });
  },
});

// Type alias for all possible errors
export type InviteUserErrors = UserAlreadyInvitedError | UserAlreadyExistsError;
