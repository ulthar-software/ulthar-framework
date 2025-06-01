import type { CryptoService, Infer, TimeService } from "@fabric/core";
import { Effect, Field, hours, Schema, UnexpectedError } from "@fabric/core";
import { PasswordResetRequestedEvent } from "../../models/password-reset.js";
import { AccessPolicy } from "../../security/access-policy.js";
import type { DomainEventStore } from "../../services/event-store.js";
import type { DomainStateStore } from "../../services/state-store.js";
import { UseCase } from "../../utils/use-case.js";

export interface RequestPasswordResetDependencies {
  state: DomainStateStore;
  events: DomainEventStore;
  crypto: CryptoService;
  time: TimeService;
}

export const RequestPasswordResetInputModel = new Schema({
  email: Field.email(),
});
export type RequestPasswordResetInput = Infer<
  typeof RequestPasswordResetInputModel
>;

export const PasswordResetTokenExpirationTime = hours(1);

export const RequestPasswordResetUseCase = new UseCase({
  auth: AccessPolicy.Anonymous(),
  name: "requestPasswordReset",
  type: "command",
  inputSchema: RequestPasswordResetInputModel,
  effect: (
    { state, events, crypto, time }: RequestPasswordResetDependencies,
    { email }: RequestPasswordResetInput,
  ): Effect<void, UnexpectedError> => {
    return Effect.fromGen(function* () {
      const user = yield* state
        .from("users")
        .where({ email })
        .selectOne()
        .mapError(() => new UnexpectedError());

      const token = crypto.generateRandomToken(24);
      const hashedToken = yield* crypto.hashPassword(token);

      if (!user.isValue()) return;

      yield* events.append(
        "passwordResets",
        PasswordResetRequestedEvent.from({
          id: crypto.randomUUID(),
          version: 1,
          streamId: crypto.randomUUID(),
          payload: {
            email,
            expiresAt: time.now().add(PasswordResetTokenExpirationTime),
            token: hashedToken,
          },
        }),
      );
    });
  },
});
