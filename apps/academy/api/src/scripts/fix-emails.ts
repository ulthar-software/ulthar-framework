/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import Sqlite3 from "better-sqlite3";
import { initializeEnvironment } from "../services/build-dependencies.js";

const env = initializeEnvironment();

const db = new Sqlite3(env.get("EVENTS_DB"));

const sql = `SELECT * FROM events`;

const rows = db.prepare(sql).all();

for (const row of rows) {
  const { id, payload } = row as { id: string; payload: string };

  const eventPayload: {
    email?: string;
  } = JSON.parse(payload);
  if (eventPayload.email) {
    const email: string = eventPayload.email.toLowerCase();
    if (email !== eventPayload.email) {
      eventPayload.email = email;
      const updateSql = `UPDATE events SET payload = ? WHERE id = ?`;
      db.prepare(updateSql).run(JSON.stringify(eventPayload), id);
      console.log(`Updated event with ID ${id} to have email ${email}`);
    }
  }
}
