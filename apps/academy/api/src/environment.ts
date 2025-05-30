import type { Environment } from "@fabric/core";
import { Field, Schema } from "@fabric/core";

export const EnvSchema = new Schema({
  API_HOST: Field.string(),
  FRONTEND_HOST: Field.string(),

  EVENTS_DB: Field.string(),
  STATE_DB: Field.string(),
  MIGRATIONS_DB: Field.string(),

  JWT_SECRET: Field.string(),

  ADMIN_FIRST_NAME: Field.string(),
  ADMIN_LAST_NAME: Field.string(),
  ADMIN_EMAIL: Field.email(),
  ADMIN_PASSWORD: Field.string(),

  EMAIL_HOST: Field.string(),
  EMAIL_PORT: Field.integer(),
  EMAIL_USER: Field.string(),
  EMAIL_PASSWORD: Field.string(),
  EMAIL_DELAY_MS: Field.integer(),
  EMAIL_FROM: Field.string(),
  SUPPORT_EMAIL: Field.email(),

  TZ: Field.string(),
});
export type EnvSchema = typeof EnvSchema;

export type ApiEnvironment = Environment<EnvSchema>;
