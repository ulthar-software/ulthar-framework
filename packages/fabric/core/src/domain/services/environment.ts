import type { Model } from "../models/model.js";
import type { Infer } from "../models/schema.js";

export class Environment<TEnv extends Model> {
  private env: Infer<TEnv>;
  constructor(
    private model: TEnv,
    env: unknown,
  ) {
    this.env = this.model.parse(env).unwrapOrThrow();
  }

  get<TKey extends keyof Infer<TEnv>>(name: TKey): Infer<TEnv>[TKey] {
    return this.env[name];
  }

  set<TKey extends keyof Infer<TEnv>>(
    name: TKey,
    value: Infer<TEnv>[TKey],
  ): void {
    this.env[name] = value;
  }
}
