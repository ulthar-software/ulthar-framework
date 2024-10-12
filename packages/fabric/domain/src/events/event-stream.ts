import { AsyncResult } from "@fabric/core";
import { UUID } from "../types/uuid.js";
import { Event } from "./event.js";
import { StoredEvent } from "./stored-event.js";

export interface EventStream<
  TName extends string = string,
  TEvent extends Event = Event,
> {
  id: UUID;
  name: TName;
  append<T extends TEvent>(event: Event): AsyncResult<StoredEvent<T>>;
}

export type EventsFromStream<T extends EventStream, TKey extends string> =
  T extends EventStream<TKey, infer TEvent> ? TEvent : never;
