import { Field, Model } from "@fabric/core";

export const environmentModel = new Model("Environment", {
  API_HOST: Field.url({}),
  CLIENT_HOST: Field.url({}),
  MODE: Field.enum({ values: ["development", "production"] }),
  EMAIL_HOST: Field.string({}),
  EMAIL_PORT: Field.integer({}),
  EMAIL_USER: Field.string({}),
  EMAIL_PASSWORD: Field.string({}),
  EMAIL_FROM: Field.email({}),
});
export type ApiEnvironment = typeof environmentModel;
