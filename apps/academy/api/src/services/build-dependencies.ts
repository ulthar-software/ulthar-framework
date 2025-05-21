import "dotenv/config";

import { Environment } from "@fabric/core";
import { SQLiteStoreDriver } from "@fabric/sqlite-store";
import {
  DomainEventStore,
  DomainProjectors,
  DomainStateStore,
  DomainStreams,
} from "@ulthar/academy-domain";
import { createTransport } from "nodemailer";
import { type AppDependencies } from "../dependencies.js";
import { EmailTemplates } from "../email-templates.js";
import { EnvSchema } from "../environment.js";
import { ConcreteAuthService } from "./auth-service.js";
import { ConcreteCryptoService } from "./crypto-service.js";
import { EmailQueueService } from "./email-service.js";

export function initializeDependencies(): AppDependencies {
  const env = initializeEnvironment();

  const { events, state } = initializeStorage(env);

  const crypto = new ConcreteCryptoService();

  const auth = new ConcreteAuthService(env.get("JWT_SECRET"));

  return {
    events,
    state,
    auth,
    crypto,
    env,
  };
}

export function initializeStorage(env: Environment<EnvSchema>) {
  const eventStoreDriver = new SQLiteStoreDriver(env.get("EVENTS_DB"));
  const events = new DomainEventStore(eventStoreDriver, DomainStreams);

  const stateStoreDriver = new SQLiteStoreDriver(env.get("STATE_DB"));
  const state = new DomainStateStore(
    stateStoreDriver,
    events,
    DomainProjectors,
  );
  return { events, state };
}

export function initializeEnvironment(): Environment<EnvSchema> {
  return new Environment(EnvSchema, process.env);
}

export function initializeEmails(deps: AppDependencies) {
  const emailTransport = createEmailTransport(deps);

  return new EmailQueueService({
    env: deps.env,
    events: deps.events,
    state: deps.state,
    templates: EmailTemplates,
    emailTransport,
  });
}

export function createEmailTransport({env}: {env: Environment<EnvSchema>}) {
  return createTransport({
    host: env.get("EMAIL_HOST"),
    port: env.get("EMAIL_PORT"),
    auth: {
      user: env.get("EMAIL_USER"),
      pass: env.get("EMAIL_PASSWORD"),
    },
  });
}