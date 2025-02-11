/* eslint-disable @typescript-eslint/no-unsafe-return */
import { type Model, type ModelToType, parse } from "@fabric/models";

export class Environment<TEnv extends Model> {
  private env: ModelToType<TEnv>;
  constructor(
    private model: TEnv,
    env: unknown,
  ) {
    this.env = parse(this.model, env).unwrapOrThrow();
  }

  get<TKey extends keyof ModelToType<TEnv>>(
    name: TKey,
  ): ModelToType<TEnv>[TKey] {
    return this.env[name];
  }

  set<TKey extends keyof ModelToType<TEnv>>(
    name: TKey,
    value: ModelToType<TEnv>[TKey],
  ): void {
    this.env[name] = value;
  }
}
