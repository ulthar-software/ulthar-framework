import type { Infer } from "@fabric/core";
import { Environment, Field, Schema } from "@fabric/core";
import { createContext } from "react";
import env from "../../env.ts";

export const EnvSchema = new Schema({
  API_URL: Field.string(),
});
export type EnvSchema = Infer<typeof EnvSchema>;

export type EnvironmentType = Environment<typeof EnvSchema>;

export function createEnv(env: unknown): EnvironmentType {
  return new Environment(EnvSchema, env);
}

export const EnvContext = createContext<EnvironmentType>(createEnv(env));
