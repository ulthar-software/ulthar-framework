import {
  AsyncResult,
  MaybePromise,
  PosixDate,
  Run,
  VariantTag,
} from "@fabric/core";
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
import { SQLiteDatabase } from "../sqlite/sqlite-database.ts";

export class SQLiteEventStore<TEvents extends Event>
  implements EventStore<TEvents>
{
  private db: SQLiteDatabase;

  private streamVersions = new Map<UUID, bigint>();

  private eventSubscribers = new Map<
    TEvents[VariantTag],
    EventSubscriber<TEvents>[]
  >();

  constructor(private readonly dbPath: string) {
    this.db = new SQLiteDatabase(dbPath);
  }

  migrate(): AsyncResult<void, StoreQueryError> {
    return AsyncResult.tryFrom(
      () => {
        this.db.init();
        this.db.run(
          `CREATE TABLE IF NOT EXISTS events (
              id TEXT PRIMARY KEY,
              _tag TEXT NOT NULL,
              streamId TEXT NOT NULL,
              version INTEGER NOT NULL,
              timestamp NUMERIC NOT NULL,
              payload TEXT NOT NULL,
              UNIQUE(streamId, version)
            )`
        );
      },
      (error) => new StoreQueryError(error.message)
    );
  }

  getEventsFromStream(
    streamId: UUID
  ): AsyncResult<StoredEvent<TEvents>[], StoreQueryError> {
    return AsyncResult.tryFrom(
      () => {
        const events = this.db.allPrepared(
          `SELECT * FROM events WHERE streamId = $id`,
          {
            $id: streamId,
          },
          (e) => ({
            id: e.id,
            streamId: e.streamId,
            _tag: e._tag,
            version: BigInt(e.version),
            timestamp: new PosixDate(e.timestamp),
            payload: JSONUtils.parse(e.payload),
          })
        );
        return events;
      },
      (error) => new StoreQueryError(error.message)
    );
  }

  append<T extends TEvents>(
    event: T
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
        })
    );
  }

  private notifySubscribers(event: StoredEvent<TEvents>): AsyncResult<void> {
    return AsyncResult.from(async () => {
      const subscribers = this.eventSubscribers.get(event[VariantTag]) || [];
      await Promise.all(subscribers.map((subscriber) => subscriber(event)));
    });
  }

  private getLastVersion(streamId: UUID): AsyncResult<bigint, StoreQueryError> {
    return AsyncResult.tryFrom(
      () => {
        const { lastVersion } = this.db.onePrepared(
          `SELECT max(version) as lastVersion FROM events WHERE streamId = $id`,
          {
            $id: streamId,
          }
        );

        return !lastVersion ? 0n : BigInt(lastVersion);
      },
      (error) => new StoreQueryError(error.message)
    );
  }

  subscribe<TEventKey extends TEvents[VariantTag]>(
    eventNames: TEventKey[],
    subscriber: (
      event: StoredEvent<EventFromKey<TEvents, TEventKey>>
    ) => MaybePromise<void>
  ): void {
    eventNames.forEach((event) => {
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
      (error) => new StoreQueryError(error.message)
    );
  }

  private storeEvent<T extends Event>(
    streamId: UUID,
    version: bigint,
    event: T
  ): AsyncResult<StoredEvent<T>, StoreQueryError> {
    return AsyncResult.tryFrom(
      () => {
        const storedEvent: StoredEvent<T> = {
          ...event,
          version: version,
          timestamp: new PosixDate(),
        };
        this.db.runPrepared(
          `INSERT INTO events (id, streamId, _tag, version, timestamp, payload) 
          VALUES ($id, $streamId, $_tag, $version, $timestamp, $payload)`,
          {
            $id: storedEvent.id,
            $streamId: streamId,
            $_tag: storedEvent[VariantTag],
            $version: storedEvent.version.toString(),
            $timestamp: storedEvent.timestamp.timestamp,
            $payload: JSON.stringify(storedEvent.payload),
          }
        );
        return storedEvent;
      },
      (error) => new StoreQueryError(error.message)
    );
  }
}
