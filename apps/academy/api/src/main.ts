import "dotenv/config";

import { JSONExtReviver } from "@fabric/core";
import { DomainUseCases } from "@ulthar/academy-domain";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import type { AppDependencies } from "./dependencies.js";
import { buildDependencies } from "./services/build-dependencies.js";
import { createHTTPEndpoints } from "./utils/create-http-endpoints.js";

const app = express();

const PORT = process.env.PORT ?? 3000;

const dependencies = buildDependencies();

const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

app.use(morgan("common"));

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

createHTTPEndpoints<AppDependencies>(app, dependencies, DomainUseCases);

// Handle graceful shutdown
process.on("SIGTERM", () => void gracefulShutdown());
process.on("SIGINT", () => void gracefulShutdown());

async function gracefulShutdown() {
  console.log("Received shutdown signal, closing connections...");

  try {
    // Close all connections
    await dependencies.state.close().runOrThrow();
    await dependencies.events.close().runOrThrow();
    console.log("Database connections closed");

    // Close HTTP server
    server.close(() => {
      console.log("HTTP server closed");
      process.exit(0);
    });

    // Force exit after 5 seconds if server hasn't closed
    setTimeout(() => {
      console.log("Forcing exit after timeout");
      process.exit(1);
    }, 5000);
  } catch (error) {
    console.error("Error during graceful shutdown:", error);
    process.exit(1);
  }
}
