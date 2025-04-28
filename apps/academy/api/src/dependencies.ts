import type { Environment } from "@fabric/core";
import { Field, Schema, type UnionToIntersection } from "@fabric/core";
import type { UseCaseDependencies, UseCases } from "@ulthar/academy-domain";
import type { AuthDependencies } from "./utils/parse-access-token.js";

export const EnvSchema = new Schema({
  API_HOST: Field.string(),
  CLIENT_HOST: Field.string(),

  EVENTS_DB: Field.string(),
  STATE_DB: Field.string(),
  MIGRATIONS_DB: Field.string(),

  JWT_SECRET: Field.string(),

  ADMIN_FIRST_NAME: Field.string(),
  ADMIN_LAST_NAME: Field.string(),
  ADMIN_EMAIL: Field.email(),
  ADMIN_PASSWORD: Field.string(),
});
export type EnvSchema = typeof EnvSchema;

export type BaseDependencies = AuthDependencies & {
  env: Environment<EnvSchema>;
};

export type AppDependencies = Omit<
  UnionToIntersection<UseCaseDependencies<UseCases[number]>>,
  "currentUser"
> &
  BaseDependencies;
