import "dotenv/config";

import { JSONExtReviver } from "@fabric/core";
import { UseCases } from "@ulthar/academy-domain";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import type { AppDependencies } from "./dependencies.js";
import { buildDependencies } from "./services/build-dependencies.js";
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

createHTTPEndpoints<AppDependencies>(app, buildDependencies(), UseCases);
