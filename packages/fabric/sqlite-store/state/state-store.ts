import { Effect, UnexpectedError, UUID } from "@fabric/core";
import {
  Model,
  ModelSchemaFromModels,
  ModelToType,
  StoreQuery,
  StoreQueryError,
  WritableStateStore,
} from "@fabric/domain";
import { modelToSql } from "../sqlite/model-to-sql.ts";
import {
  keyToParamKey,
  recordToSQLKeys,
  recordToSQLParamKeys,
  recordToSQLParamRecord,
  recordToSQLSet,
} from "../sqlite/record-utils.ts";
import { SQLiteDatabase } from "../sqlite/sqlite-database.ts";
import { QueryBuilder } from "./query-builder.ts";

export class SQLiteStateStore<TModel extends Model>
  implements WritableStateStore<TModel> {
  private schema: ModelSchemaFromModels<TModel>;
  private db: SQLiteDatabase;

  constructor(private readonly dbPath: string, models: TModel[]) {
    this.schema = models.reduce((acc, model: TModel) => {
      return {
        ...acc,
        [model.name]: model,
      };
    }, {} as ModelSchemaFromModels<TModel>);

    this.db = new SQLiteDatabase(dbPath);
  }

  insertInto<T extends keyof ModelSchemaFromModels<TModel>>(
    collection: T,
    record: ModelToType<ModelSchemaFromModels<TModel>[T]>,
  ): Effect<void, StoreQueryError> {
    const model = this.schema[collection];

    return Effect.tryFrom(
      () => {
        this.db.runPrepared(
          `INSERT INTO ${model.name} (${
            recordToSQLKeys(
              record,
            )
          }) VALUES (${recordToSQLParamKeys(record)})`,
          recordToSQLParamRecord(model, record),
        );
      },
      (error) => new StoreQueryError(error.message),
    );
  }

  from<T extends keyof ModelSchemaFromModels<TModel>>(
    collection: T,
  ): StoreQuery<ModelToType<ModelSchemaFromModels<TModel>[T]>> {
    return new QueryBuilder(this.db, this.schema, {
      from: collection,
    }) as StoreQuery<ModelToType<ModelSchemaFromModels<TModel>[T]>>;
  }

  update<T extends keyof ModelSchemaFromModels<TModel>>(
    collection: T,
    id: UUID,
    record: Partial<ModelToType<ModelSchemaFromModels<TModel>[T]>>,
  ): Effect<void, StoreQueryError> {
    const model = this.schema[collection];

    return Effect.tryFrom(
      () => {
        const params = recordToSQLParamRecord(model, {
          ...record,
          id,
        });
        this.db.runPrepared(
          `UPDATE ${model.name} SET ${
            recordToSQLSet(
              record,
            )
          } WHERE id = ${keyToParamKey("id")}`,
          params,
        );
      },
      (error) => new StoreQueryError(error.message),
    );
  }

  delete<T extends keyof ModelSchemaFromModels<TModel>>(
    collection: T,
    id: UUID,
  ): Effect<void, StoreQueryError> {
    const model = this.schema[collection];

    return Effect.tryFrom(
      () => {
        this.db.runPrepared(
          `DELETE FROM ${model.name} WHERE id = ${keyToParamKey("id")}`,
          {
            [keyToParamKey("id")]: id,
          },
        );
      },
      (error) => new StoreQueryError(error.message),
    );
  }

  migrate(): Effect<void, StoreQueryError> {
    return Effect.tryFrom(
      async () => {
        this.db.init();
        await this.db.withTransaction(() => {
          for (const modelKey in this.schema) {
            const model =
              this.schema[modelKey as keyof ModelSchemaFromModels<TModel>];
            this.db.runPrepared(modelToSql(model));
          }
        });
      },
      (error) => new StoreQueryError(error.message),
    );
  }

  close(): Effect<void, UnexpectedError> {
    return Effect.tryFrom(
      () => this.db.close(),
      (e) => new UnexpectedError(e.message),
    );
  }
}
