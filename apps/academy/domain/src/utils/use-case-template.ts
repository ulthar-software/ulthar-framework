import type { Infer } from "@fabric/core";
import { Effect, Field, Schema } from "@fabric/core";
import { AccessPolicy } from "../security/access-policy.js";
import type { UserAccess } from "../services/auth-service.js";
import type { DomainCryptoService } from "../services/crypto-service.js";
import type { DomainEventStore } from "../services/event-store.js";
import type { DomainStateStore } from "../services/state-store.js";
import { UseCase } from "./use-case.js";

export interface TemplateUseCaseDependencies {
  state: DomainStateStore;
  events: DomainEventStore;
  crypto: DomainCryptoService;
  currentUser: UserAccess;
}

export const TemplateUseCaseInputModel = new Schema({
  courseId: Field.uuid(),
});
export type TemplateUseCaseInput = Infer<typeof TemplateUseCaseInputModel>;

export interface TemplateUseCaseOutput {
  ok: boolean;
}

export const TemplateUseCase = new UseCase({
  auth: AccessPolicy.Authenticated(),
  name: "templateUseCase",
  type: "command",
  inputSchema: TemplateUseCaseInputModel,
  effect: (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    dependencies: TemplateUseCaseDependencies,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    payload: TemplateUseCaseInput,
  ) => {
    return Effect.fromGen(function* () {
      // Check if the course exists
      yield* Effect.ok();

      return { ok: true };
    });
  },
});
