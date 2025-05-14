import type { UnexpectedError, UUID } from "@fabric/core";
import { Effect, Field, Schema, TaggedError, type Infer } from "@fabric/core";
import { UserInviteAcceptedEvent } from "../../models/user-invite.js";
import { UserRegisteredByInvitationEvent } from "../../models/user.js";
import { AccessPolicy } from "../../security/access-policy.js";
import type { DomainCryptoService } from "../../services/crypto-service.js";
import type { DomainEventStore } from "../../services/event-store.js";
import type { DomainStateStore } from "../../services/state-store.js";
import { UseCase } from "../../utils/use-case.js";

// Input model for the register user use case
export const RegisterUserInputModel = new Schema({
  firstName: Field.string(),
  lastName: Field.string(),
  email: Field.email(),
  password: Field.string(),
  inviteCode: Field.string(),
});
export type RegisterUserInput = Infer<typeof RegisterUserInputModel>;

// Dependencies needed for the register user use case
export interface RegisterUserDependencies {
  state: DomainStateStore;
  events: DomainEventStore;
  crypto: DomainCryptoService;
}

// Custom errors for the register user use case
export class InvalidInviteCodeError extends TaggedError<"InvalidInviteCodeError"> {
  constructor() {
    super(
      "InvalidInviteCodeError",
      "The provided invitation code is invalid or expired",
    );
  }
}

export interface RegisterUserOutput {
  userId: UUID;
}

// Define the use case
export const RegisterUserUseCase = new UseCase({
  name: "registerUser",
  type: "command",
  auth: AccessPolicy.Anonymous(),
  inputSchema: RegisterUserInputModel,
  effect: (
    { state, events, crypto }: RegisterUserDependencies,
    { firstName, lastName, email, password, inviteCode }: RegisterUserInput,
  ): Effect<RegisterUserOutput, UnexpectedError | InvalidInviteCodeError> => {
    return Effect.fromGen(function* () {
      yield* state.from("users").where({ email }).assertNone();

      const invite = yield* state
        .from("userInvites")
        .where({ email, code: inviteCode })
        .selectOneOrFail()
        .mapError(() => new InvalidInviteCodeError());

      const userId = invite.id;
      const hashedPassword = yield* crypto.hashPassword(password);

      const registrationEvent = UserRegisteredByInvitationEvent.from({
        id: crypto.randomUUID(),
        streamId: userId,
        version: 1,
        payload: {
          firstName,
          lastName,
          email,
          hashedPassword,
          role: invite.role,
          invitedBy: invite.id,
        },
      });

      const acceptEvent = UserInviteAcceptedEvent.from({
        id: crypto.randomUUID(),
        streamId: invite.id,
        version: invite.version + 1,
        payload: {},
      });

      yield* events.append("users", registrationEvent);
      yield* events.append("userInvites", acceptEvent);

      return { userId };
    });
  },
});
