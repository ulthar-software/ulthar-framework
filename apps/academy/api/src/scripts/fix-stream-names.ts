import type { UUID } from "@fabric/core";
import { DomainStreams } from "@ulthar/academy-domain";
import Sqlite3 from "better-sqlite3";
import { initializeEnvironment } from "../services/build-dependencies.js";
import {
  backupDatabases,
  recreateState,
} from "../utils/database-operations.js";

const env = initializeEnvironment();

await backupDatabases(env);

const db = new Sqlite3(env.get("EVENTS_DB"));

const rows = db.prepare(`SELECT * FROM events`).all();

db.prepare(
  `ALTER TABLE events ADD COLUMN streamName TEXT NOT NULL DEFAULT "unknown"`,
).run();

for (const row of rows) {
  const { id, type } = row as {
    id: UUID;
    type: string;
    payload: string;
  };

  const stream = DomainStreams.find((s) =>
    s.events.find((e) => e.name === type),
  );

  if (!stream) {
    console.warn(`Stream not found for event type ${type} in event ID ${id}`);
    continue;
  }
  const streamName = stream.name;

  db.prepare(`UPDATE events SET streamName = ? WHERE id = ?`).run(
    streamName,
    id,
  );
}

await recreateState(env);

console.log("All events updated with stream names");
