/* eslint-disable @typescript-eslint/no-explicit-any */
import { MaybePromise } from "@fabric/core";
import SQLite from "sqlite3";

export class SQLiteDatabase {
  db: SQLite.Database;

  private cachedStatements = new Map<string, SQLite.Statement>();

  constructor(private readonly path: string) {
    this.db = new SQLite.Database(path);
  }

  async init() {
    await this.run("PRAGMA journal_mode = WAL");
    await this.run("PRAGMA foreign_keys = ON");
  }

  async close() {
    await this.finalizeStatements();
    await new Promise<void>((resolve, reject) => {
      this.db.close((err: Error | null) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async withTransaction(fn: () => MaybePromise<void>) {
    try {
      await this.run("BEGIN TRANSACTION");
      await fn();
      await this.run("COMMIT");
    } catch {
      await this.run("ROLLBACK");
    }
  }

  run(sql: string, params?: Record<string, any>) {
    return new Promise<void>((resolve, reject) => {
      this.db.run(sql, params, (err: Error | null) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  runPrepared(sql: string, params?: Record<string, any>) {
    const cachedStmt = this.getCachedStatement(sql);

    return new Promise<void>((resolve, reject) => {
      cachedStmt.run(params, (err: Error | null) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  allPrepared(
    sql: string,
    params?: Record<string, any>,
    transformer?: (row: any) => any,
  ) {
    const cachedStmt = this.getCachedStatement(sql);

    return new Promise<any>((resolve, reject) => {
      cachedStmt.all(
        params,
        (err: Error | null, rows: Record<string, any>[]) => {
          if (err) {
            reject(err);
          } else {
            try {
              resolve(transformer ? rows.map(transformer) : rows);
            } catch (e) {
              reject(e);
            }
          }
        },
      );
    });
  }

  onePrepared(
    sql: string,
    params?: Record<string, any>,
    transformer?: (row: any) => any,
  ) {
    const cachedStmt = this.getCachedStatement(sql);

    return new Promise<any>((resolve, reject) => {
      cachedStmt.all(
        params,
        (err: Error | null, rows: Record<string, any>[]) => {
          if (err) {
            reject(err);
          } else {
            try {
              resolve(transformer ? rows.map(transformer)[0] : rows[0]);
            } catch (e) {
              reject(e);
            }
          }
        },
      );
    });
  }

  private getCachedStatement(sql: string) {
    let cached = this.cachedStatements.get(sql);

    if (!cached) {
      const stmt = this.db.prepare(sql);
      this.cachedStatements.set(sql, stmt);
      cached = stmt;
    }
    return cached;
  }

  private async finalizeStatements() {
    for (const stmt of this.cachedStatements.values()) {
      await new Promise<void>((resolve, reject) => {
        stmt.finalize((err: Error | null) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }
  }
}
