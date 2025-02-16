/* eslint-disable @typescript-eslint/no-explicit-any */

import { PosixDate } from "../../time/posix-date.js";
import type { Keyof } from "../../types/keyof.js";
import type { EmbeddedField, FieldToType } from "../models/fields.js";
import { Field } from "../models/fields.js";
import type { ModelFields, ModelToType } from "../models/model.js";
import { Model } from "../models/model.js";

/**
 * An event is a tagged variant with a payload, an id, a streamId, a version and a timestamp.
 */
export class DomainEvent<
  const TName extends string = string,
  const TFields extends ModelFields = any,
> extends Model<TName, BaseEventFields & { payload: EmbeddedField<TFields> }> {
  constructor(name: TName, fields: TFields) {
    super(
      name,
      {
        ...BaseEventFields,
        payload: Field.embedded(fields),
      },
      {
        constraints: [{ type: "unique", fields: ["streamId", "version"] }],
      },
    );
  }

  from(
    data: Omit<ModelToType<this>, "type" | "timestamp">,
  ): ModelToType<this> & { type: TName } {
    return {
      ...data,
      type: this.name,
      timestamp: new PosixDate(),
    } as ModelToType<this> & { type: TName };
  }
}

export const BaseEventFields = {
  id: Field.uuid({ isPrimaryKey: true }),
  type: Field.string(),
  streamId: Field.uuid(),
  version: Field.integer({ hasArbitraryPrecision: true }),
  timestamp: Field.posixDate(),
} as const;
export type BaseEventFields = typeof BaseEventFields;

export type EventToType<TEvent extends DomainEvent> = {
  [K in Keyof<TEvent["fields"]>]: K extends "type"
    ? TEvent["name"]
    : FieldToType<TEvent["fields"][K]>;
};

export type EventFromKey<
  TEvents extends DomainEvent,
  TKey extends TEvents["name"],
> = Extract<TEvents, { name: TKey }>;
