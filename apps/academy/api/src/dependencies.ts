import { type UnionToIntersection } from "@fabric/core";
import type {
  DomainUseCases,
  UseCaseDependencies,
} from "@ulthar/academy-domain";
import type { ApiEnvironment } from "./environment.js";
import type { EmailQueueService } from "./services/email-service.js";
import type { AuthDependencies } from "./utils/parse-access-token.js";

export type BaseDependencies = AuthDependencies & {
  env: ApiEnvironment;
  emails: EmailQueueService;
};

export type AppDependencies = Omit<
  UnionToIntersection<UseCaseDependencies<DomainUseCases[number]>>,
  "currentUser"
> &
  BaseDependencies;
