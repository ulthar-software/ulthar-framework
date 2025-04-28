import { Environment } from "@fabric/core";
import { SQLiteStoreDriver } from "@fabric/sqlite-store";
import {
  DomainEventStore,
  DomainProjectors,
  DomainStateStore,
  DomainStreams,
} from "@ulthar/academy-domain";
import { EnvSchema, type AppDependencies } from "../dependencies.js";
import { ConcreteAuthService } from "./auth-service.js";
import { ConcreteCryptoService } from "./crypto-service.js";

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

  return {
    events,
    state,
    auth,
    crypto,
    logger: console,
    env,
  };
}
