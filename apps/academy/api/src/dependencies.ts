import type { DomainDependencies } from "@ulthar/academy-domain";
import type { ApiEnvironment } from "./environment.js";
import type { AuthDependencies } from "./utils/parse-access-token.js";

export type BaseDependencies = AuthDependencies & {
  env: ApiEnvironment;
};

export type AppDependencies = DomainDependencies & BaseDependencies;
