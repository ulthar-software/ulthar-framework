/* eslint-disable @typescript-eslint/no-explicit-any */
import { UUID } from "../types/uuid.js";

/**
 * An event is a tagged variant with a payload and a timestamp.
 */
export interface Event<TTag extends string = string, TPayload = any> {
  readonly type: TTag;
  readonly id: UUID;
  readonly streamId: UUID;
  readonly payload: TPayload;
}
