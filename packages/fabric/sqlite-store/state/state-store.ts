import { AsyncResult, UnexpectedError } from "@fabric/core";
import {
  Model,
  ModelSchemaFromModels,
  ModelToType,
  StoreQuery,
  StoreQueryError,
  UUID,
  WritableStateStore,
} from "@fabric/domain";
import { modelToSql } from "../sqlite/model-to-sql.ts";
import {
  keyToParam,
  recordToSQLKeyParams,
  recordToSQLKeys,
  recordToSQLParams,
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
  ): AsyncResult<void, StoreQueryError> {
    const model = this.schema[collection];

    return AsyncResult.tryFrom(
      () => {
        this.db.runPrepared(
          `INSERT INTO ${model.name} (${
            recordToSQLKeys(
              record,
            )
          }) VALUES (${recordToSQLKeyParams(record)})`,
          recordToSQLParams(model, record),
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
  ): AsyncResult<void, StoreQueryError> {
    const model = this.schema[collection];

    return AsyncResult.tryFrom(
      () => {
        const params = recordToSQLParams(model, {
          ...record,
          id,
        });
        this.db.runPrepared(
          `UPDATE ${model.name} SET ${
            recordToSQLSet(
              record,
            )
          } WHERE id = ${keyToParam("id")}`,
          params,
        );
      },
      (error) => new StoreQueryError(error.message),
    );
  }

  delete<T extends keyof ModelSchemaFromModels<TModel>>(
    collection: T,
    id: UUID,
  ): AsyncResult<void, StoreQueryError> {
    const model = this.schema[collection];

    return AsyncResult.tryFrom(
      () => {
        this.db.runPrepared(
          `DELETE FROM ${model.name} WHERE id = ${keyToParam("id")}`,
          { $id: id },
        );
      },
      (error) => new StoreQueryError(error.message),
    );
  }

  migrate(): AsyncResult<void, StoreQueryError> {
    return AsyncResult.tryFrom(
      async () => {
        await this.db.init();
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

  close(): AsyncResult<void, UnexpectedError> {
    return AsyncResult.from(() => this.db.close());
  }
}