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

export function buildDependencies(): AppDependencies {
  const env = new Environment(EnvSchema, process.env);

  const eventStoreDriver = new SQLiteStoreDriver(env.get("EVENTS_DB"));
  const events = new DomainEventStore(eventStoreDriver, DomainStreams);

  const stateStoreDriver = new SQLiteStoreDriver(env.get("STATE_DB"));
  const state = new DomainStateStore(
    stateStoreDriver,
    events,
    DomainProjectors,
  );

  const crypto = new ConcreteCryptoService();

  const auth = new ConcreteAuthService(env.get("JWT_SECRET"));

  const emailTransport = createTransport({
    host: env.get("EMAIL_HOST"),
    port: env.get("EMAIL_PORT"),
    auth: {
      user: env.get("EMAIL_USER"),
      pass: env.get("EMAIL_PASSWORD"),
    },
  });

  const emails = new EmailQueueService({
    env,
    events,
    state,
    templates: EmailTemplates,
    emailTransport,
  });

  return {
    events,
    state,
    auth,
    crypto,
    env,
    emails,
  };
}
