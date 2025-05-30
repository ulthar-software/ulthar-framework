```ts
import type { Infer } from "@fabric/core";
import { Effect, Field, Schema } from "@fabric/core";

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
```
