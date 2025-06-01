import type {
  CryptoService,
  Infer,
  TimeService,
  UnexpectedError,
} from "@fabric/core";
import {
  Effect,
  Field,
  isGreaterThan,
  Schema,
  TaggedError,
} from "@fabric/core";
import { PasswordResetCompletedEvent } from "../../models/password-reset.js";
import { UserPasswordChangedEvent } from "../../models/user.js";
import { AccessPolicy } from "../../security/access-policy.js";
import type { DomainEventStore } from "../../services/event-store.js";
import type { DomainStateStore } from "../../services/state-store.js";
import { UseCase } from "../../utils/use-case.js";

export interface ResetPasswordDependencies {
  events: DomainEventStore;
  state: DomainStateStore;
  crypto: CryptoService;
  time: TimeService;
}

export const ResetPasswordInputModel = new Schema({
  email: Field.email(),
  token: Field.string(),
  newPassword: Field.string(),
});

export type ResetPasswordInput = Infer<typeof ResetPasswordInputModel>;

export class InvalidPasswordResetTokenError extends TaggedError<"InvalidPasswordResetTokenError"> {
  constructor() {
    super("InvalidPasswordResetTokenError");
  }
}

export const ResetPasswordUseCase = new UseCase({
  name: "resetPassword",
  type: "command",
  auth: AccessPolicy.Anonymous(),
  inputSchema: ResetPasswordInputModel,
  effect: (
    { events, state, crypto, time }: ResetPasswordDependencies,
    { token, email, newPassword }: ResetPasswordInput,
  ): Effect<void, InvalidPasswordResetTokenError | UnexpectedError> => {
    return Effect.fromGen(function* () {
      const resetRequest = yield* state
        .from("passwordResets")
        .where({ email, token, expiresAt: isGreaterThan(time.now()) })
        .selectOneOrFail()
        .mapError(() => new InvalidPasswordResetTokenError());

      const user = yield* state
        .from("users")
        .where({ email })
        .selectOneOrFail();

      yield* events.append(
        "passwordResets",
        PasswordResetCompletedEvent.from({
          id: crypto.randomUUID(),
          version: resetRequest.version + 1,
          streamId: resetRequest.id,
          payload: {},
        }),
      );

      yield* events.append(
        "users",
        UserPasswordChangedEvent.from({
          id: crypto.randomUUID(),
          version: user.version + 1,
          streamId: user.id,
          payload: {
            hashedPassword: yield* crypto.hashPassword(newPassword),
          },
        }),
      );
    });
  },
});
