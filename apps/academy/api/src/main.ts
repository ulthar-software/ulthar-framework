import { JSONExtReviver } from "@fabric/core";
import { DomainUseCases, scheduledUseCases } from "@ulthar/academy-domain";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import type { AppDependencies } from "./dependencies.js";
import {
  initializeDependencies,
  initializeEmails,
  initializeScheduleService,
} from "./services/build-dependencies.js";
import { createHTTPEndpoints } from "./utils/create-http-endpoints.js";

const app = express();

const PORT = process.env.PORT ?? 3000;

const dependencies = initializeDependencies();
const emails = initializeEmails(dependencies);
const scheduleService = initializeScheduleService(
  dependencies,
  scheduledUseCases,
);

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
    // Close HTTP server
    await new Promise<void>((resolve) => {
      server.close(() => {
        console.log("HTTP server closed");
        resolve();
      });
    });

    await scheduleService.stop();
    console.log("Schedule service stopped");

    emails.stop();
    console.log("Email service stopped");

    // Close all connections
    await dependencies.state.close().runOrThrow();
    await dependencies.events.close().runOrThrow();
    console.log("Database connections closed");

    console.log("All services stopped gracefully");

    process.exit(0);
  } catch (error) {
    console.error("Error during graceful shutdown:", error);
    process.exit(1);
  }
}
