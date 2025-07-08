```ts
import type { CryptoService, Infer } from "@fabric/core";
import { Effect, Field, Schema } from "@fabric/core";

export interface TemplateDependencies {
  state: DomainStateStore;
  events: DomainEventStore;
  crypto: CryptoService;
  currentUser: UserAccess;
}

export const TemplateInputModel = new Schema({
  courseId: Field.uuid(),
});
export type TemplateInput = Infer<typeof TemplateInputModel>;

export interface TemplateOutput {
  ok: boolean;
}

export const TemplateUseCase = new UseCase({
  auth: AccessPolicy.Authenticated(),
  name: "template",
  type: "command",
  inputSchema: TemplateInputModel,
  effect: (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    dependencies: TemplateDependencies,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    payload: TemplateInput,
  ) => {
    return Effect.fromGen(function* () {
      // Check if the course exists
      yield* Effect.ok();

      return { ok: true };
    });
  },
});
```
