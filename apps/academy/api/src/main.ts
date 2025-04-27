import type { UnionToIntersection } from "@fabric/core";
import { JSONExtReviver } from "@fabric/core";
import { SQLiteStoreDriver } from "@fabric/sqlite-store";
import type { UseCaseDependencies } from "@ulthar/academy-domain";
import {
  DomainEventStore,
  DomainProjectors,
  DomainStateStore,
  DomainStreams,
  UseCases,
} from "@ulthar/academy-domain";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import { ConcreteAuthService } from "./services/auth-service.js";
import { ConcreteCryptoService } from "./services/crypto-service.js";
import type { BaseDependencies } from "./utils/create-http-endpoints.js";
import { createHTTPEndpoints } from "./utils/create-http-endpoints.js";

const app = express();

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

app.use(morgan("common"));
app.use(morgan("dev"));

app.use(
  cors({
    origin: process.env.WEB_HOST ?? "*",
    credentials: true,
  }),
);

app.use(
  express.json({
    reviver: JSONExtReviver,
  }),
);

type AppDependencies = Omit<
  UnionToIntersection<UseCaseDependencies<UseCases[number]>>,
  "currentUser"
> &
  BaseDependencies;
const eventStoreDriver = new SQLiteStoreDriver("./storage/events.db");
const eventStore = new DomainEventStore(eventStoreDriver, DomainStreams);

const stateStoreDriver = new SQLiteStoreDriver("./storage/state.db");
const stateStore = new DomainStateStore(
  stateStoreDriver,
  eventStore,
  DomainProjectors,
);

createHTTPEndpoints<AppDependencies>(
  app,
  {
    auth: new ConcreteAuthService("los gatitos son lo mejor"),
    crypto: new ConcreteCryptoService(),
    events: eventStore,
    state: stateStore,
    logger: console,
  },
  UseCases,
);
