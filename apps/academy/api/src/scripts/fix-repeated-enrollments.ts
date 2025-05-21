/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import Sqlite3 from "better-sqlite3";
import { initializeEnvironment } from "../services/build-dependencies.js";

const env = initializeEnvironment();

const db = new Sqlite3(env.get("EVENTS_DB"));

const sql = `SELECT * FROM events`;

const rows = db.prepare(sql).all();

const userIds = new Set<string>();

for (const row of rows) {
  const { id, type, payload } = row as {
    id: string;
    type: string;
    payload: string;
  };

  if (type !== "UserEnrolled") {
    continue;
  }

  const eventPayload: {
    userId: string;
  } = JSON.parse(payload);

  if (userIds.has(eventPayload.userId)) {
    //delete the event
    const deleteSql = `DELETE FROM events WHERE id = ?`;
    db.prepare(deleteSql).run(id);
    console.log(`Deleted duplicate event with ID ${id}`);
    continue;
  }

  userIds.add(eventPayload.userId);
}
