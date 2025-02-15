import type { Model, ModelToType } from "../models/model.js";
import { parseModel } from "../models/parse.js";

export class Environment<TEnv extends Model> {
  private env: ModelToType<TEnv>;
  constructor(
    private model: TEnv,
    env: unknown,
  ) {
    this.env = parseModel(this.model, env).unwrapOrThrow();
  }

  get<TKey extends keyof ModelToType<TEnv>>(
    name: TKey,
  ): ModelToType<TEnv>[TKey] {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.env[name];
  }

  set<TKey extends keyof ModelToType<TEnv>>(
    name: TKey,
    value: ModelToType<TEnv>[TKey],
  ): void {
    this.env[name] = value;
  }
}
