/* eslint-disable @typescript-eslint/no-explicit-any */
import { Database, Statement } from "sqlite3";

export function dbRun(db: Database, statement: string): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(statement, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export function dbClose(db: Database): Promise<void> {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export function prepare(db: Database, statement: string): Promise<Statement> {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(statement, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(stmt);
      }
    });
  });
}

export function run(
  stmt: Statement,
  params: Record<string, any>,
): Promise<void> {
  return new Promise((resolve, reject) => {
    stmt.run(params, (err: Error | null) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export function getAll(stmt: Statement): Promise<Record<string, any>[]> {
  return new Promise((resolve, reject) => {
    stmt.all((err: Error | null, rows: Record<string, any>[]) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

export function getOne(stmt: Statement): Promise<Record<string, any>> {
  return new Promise((resolve, reject) => {
    stmt.get((err: Error | null, row: Record<string, any>) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

export function finalize(stmt: Statement): Promise<void> {
  return new Promise((resolve, reject) => {
    stmt.finalize((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
