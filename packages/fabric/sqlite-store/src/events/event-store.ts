import { AsyncResult, MaybePromise, PosixDate, Run } from "@fabric/core";
import {
  Event,
  EventFromKey,
  EventStore,
  EventSubscriber,
  JSONUtils,
  StoredEvent,
  StoreQueryError,
  UUID,
} from "@fabric/domain";
import { SQLiteDatabase } from "../sqlite/sqlite-database.js";

export class SQLiteEventStore<TEvents extends Event>
  implements EventStore<TEvents>
{
  private db: SQLiteDatabase;

  private streamVersions = new Map<UUID, bigint>();

  private eventSubscribers = new Map<
    TEvents["type"],
    EventSubscriber<TEvents>[]
  >();

  constructor(private readonly dbPath: string) {
    this.db = new SQLiteDatabase(dbPath);
  }

  async migrate(): AsyncResult<void, StoreQueryError> {
    return AsyncResult.tryFrom(
      async () => {
        await this.db.init();
        await this.db.run(
          `CREATE TABLE IF NOT EXISTS events (
              id TEXT PRIMARY KEY,
              type TEXT NOT NULL,
              streamId TEXT NOT NULL,
              version INTEGER NOT NULL,
              timestamp NUMERIC NOT NULL,
              payload TEXT NOT NULL,
              UNIQUE(streamId, version)
            )`,
        );
      },
      (error) => new StoreQueryError(error.message, { error }),
    );
  }

  async getEventsFromStream(
    streamId: UUID,
  ): AsyncResult<StoredEvent<TEvents>[], StoreQueryError> {
    return AsyncResult.tryFrom(
      async () => {
        const events = await this.db.allPrepared(
          `SELECT * FROM events WHERE streamId = $id`,
          {
            $id: streamId,
          },
          (event) => ({
            id: event.id,
            streamId: event.streamId,
            type: event.type,
            version: BigInt(event.version),
            timestamp: new PosixDate(event.timestamp),
            payload: JSONUtils.parse(event.payload),
          }),
        );
        return events;
      },
      (error) => new StoreQueryError(error.message, { error }),
    );
  }

  async append<T extends TEvents>(
    event: T,
  ): AsyncResult<StoredEvent<T>, StoreQueryError> {
    return Run.seq(
      () => this.getLastVersion(event.streamId),
      (version) =>
        AsyncResult.from(() => {
          this.streamVersions.set(event.streamId, version + 1n);
          return version;
        }),
      (version) => this.storeEvent(event.streamId, version + 1n, event),
      (storedEvent) =>
        AsyncResult.from(async () => {
          await this.notifySubscribers(storedEvent);
          return storedEvent;
        }),
    );
  }

  private async notifySubscribers(
    event: StoredEvent<TEvents>,
  ): AsyncResult<void> {
    return AsyncResult.from(async () => {
      const subscribers = this.eventSubscribers.get(event.type) || [];
      await Promise.all(subscribers.map((subscriber) => subscriber(event)));
    });
  }

  private async getLastVersion(
    streamId: UUID,
  ): AsyncResult<bigint, StoreQueryError> {
    return AsyncResult.tryFrom(
      async () => {
        const { lastVersion } = await this.db.onePrepared(
          `SELECT max(version) as lastVersion FROM events WHERE streamId = $id`,
          {
            $id: streamId,
          },
        );

        return !lastVersion ? 0n : BigInt(lastVersion);
      },
      (error) =>
        new StoreQueryError(`Error getting last version:${error.message}`, {
          error,
        }),
    );
  }

  subscribe<TEventKey extends TEvents["type"]>(
    events: TEventKey[],
    subscriber: (
      event: StoredEvent<EventFromKey<TEvents, TEventKey>>,
    ) => MaybePromise<void>,
  ): void {
    events.forEach((event) => {
      const subscribers = this.eventSubscribers.get(event) || [];
      const newSubscribers = [
        ...subscribers,
        subscriber,
      ] as EventSubscriber<TEvents>[];
      this.eventSubscribers.set(event, newSubscribers);
    });
  }

  close(): AsyncResult<void, StoreQueryError> {
    return AsyncResult.tryFrom(
      () => this.db.close(),
      (error) => new StoreQueryError(error.message, { error }),
    );
  }

  private storeEvent<T extends Event>(
    streamId: UUID,
    version: bigint,
    event: T,
  ): AsyncResult<StoredEvent<T>, StoreQueryError> {
    return AsyncResult.tryFrom(
      async () => {
        const storedEvent: StoredEvent<T> = {
          ...event,
          version: version,
          timestamp: new PosixDate(),
        };
        await this.db.runPrepared(
          `INSERT INTO events (id, streamId, type, version, timestamp, payload) 
          VALUES ($id, $streamId, $type, $version, $timestamp, $payload)`,
          {
            $id: storedEvent.id,
            $streamId: streamId,
            $type: storedEvent.type,
            $version: storedEvent.version.toString(),
            $timestamp: storedEvent.timestamp.timestamp,
            $payload: JSON.stringify(storedEvent.payload),
          },
        );
        return storedEvent;
      },
      (error) => new StoreQueryError("Error appending event", { error }),
    );
  }
}
