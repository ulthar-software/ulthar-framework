import type { CryptoService, TimeService } from "@fabric/core";
import { Effect, isLessOrEqualTo } from "@fabric/core";
import { PasswordResetRequestExpiredEvent } from "../../models/password-reset.js";
import { AccessPolicy } from "../../security/access-policy.js";
import type { DomainEventStore } from "../../services/event-store.js";
import type { DomainStateStore } from "../../services/state-store.js";
import { UseCase } from "../../utils/use-case.js";

export interface ClearPasswordResetRequestUseCaseDependencies {
  state: DomainStateStore;
  events: DomainEventStore;
  time: TimeService;
  crypto: CryptoService;
}

export const ClearPasswordResetRequestUseCase = new UseCase({
  auth: AccessPolicy.System(),
  name: "clearPasswordResetRequestUseCase",
  type: "command",
  effect: ({
    state,
    events,
    time,
    crypto,
  }: ClearPasswordResetRequestUseCaseDependencies) => {
    return Effect.fromGen(function* () {
      const resetRequests = yield* state
        .from("passwordResets")
        .where({ expiresAt: isLessOrEqualTo(time.now()) })
        .select();

      for (const request of resetRequests) {
        yield* events.append(
          "passwordResets",
          PasswordResetRequestExpiredEvent.from({
            id: crypto.randomUUID(),
            version: request.version + 1,
            streamId: request.id,
            payload: {},
          }),
        );
      }
    });
  },
});
