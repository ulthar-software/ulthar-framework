import type { CryptoService, Infer, TimeService } from "@fabric/core";
import { Effect, Field, hours, Schema } from "@fabric/core";
import { PasswordResetRequestedEvent } from "../../models/password-reset.js";
import { AccessPolicy } from "../../security/access-policy.js";
import type { DomainEventStore } from "../../services/event-store.js";
import type { DomainStateStore } from "../../services/state-store.js";
import { UseCase } from "../../utils/use-case.js";

export interface RequestPasswordUseCaseDependencies {
  state: DomainStateStore;
  events: DomainEventStore;
  crypto: CryptoService;
  time: TimeService;
}

export const RequestPasswordUseCaseInputModel = new Schema({
  email: Field.email(),
});
export type RequestPasswordUseCaseInput = Infer<
  typeof RequestPasswordUseCaseInputModel
>;

export const PasswordResetTokenExpirationTime = hours(1);

export const RequestPasswordResetUseCase = new UseCase({
  auth: AccessPolicy.Anonymous(),
  name: "requestPasswordUseCase",
  type: "command",
  inputSchema: RequestPasswordUseCaseInputModel,
  effect: (
    { state, events, crypto, time }: RequestPasswordUseCaseDependencies,
    { email }: RequestPasswordUseCaseInput,
  ) => {
    return Effect.fromGen(function* () {
      const user = yield* state.from("users").where({ email }).selectOne();

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
