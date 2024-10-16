// deno-lint-ignore-file no-explicit-any
import { MaybePromise } from "@fabric/core";
import { Database, Statement } from "jsr:@db/sqlite";

export class SQLiteDatabase {
  db: Database;

  private cachedStatements = new Map<string, Statement>();

  constructor(private readonly path: string) {
    this.db = new Database(path);
  }

  init() {
    this.run("PRAGMA journal_mode = WAL");
    this.run("PRAGMA foreign_keys = ON");
  }

  close() {
    this.finalizeStatements();
    this.db.close();
  }

  async withTransaction(fn: () => MaybePromise<void>) {
    try {
      this.run("BEGIN TRANSACTION");
      await fn();
      this.run("COMMIT");
    } catch {
      this.run("ROLLBACK");
    }
  }

  run(sql: string, params?: Record<string, any>) {
    this.db.run(sql, params);
  }

  runPrepared(sql: string, params?: Record<string, any>) {
    const cachedStmt = this.getCachedStatement(sql);

    cachedStmt.run(params);
  }

  allPrepared(
    sql: string,
    params?: Record<string, any>,
    transformer?: (row: any) => any,
  ) {
    const cachedStmt = this.getCachedStatement(sql);

    const result = cachedStmt.all(params);

    return transformer ? result.map(transformer) : result;
  }

  onePrepared(
    sql: string,
    params?: Record<string, any>,
    transformer?: (row: any) => any,
  ) {
    const cachedStmt = this.getCachedStatement(sql);

    const result = cachedStmt.all(params);

    if (result.length === 0) {
      return;
    }

    return transformer ? transformer(result[0]) : result[0];
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

  private finalizeStatements() {
    for (const stmt of this.cachedStatements.values()) {
      stmt.finalize();
    }
  }
}
