import { TaggedVariant } from "../../variant/variant.js";
import { UUID } from "../types/uuid.js";

/**
 * An event is a tagged variant with a payload and a timestamp.
 */
export interface Event<TTag extends string, TPayload>
  extends TaggedVariant<TTag> {
  streamId: UUID;
  payload: TPayload;
  timestamp: number;
}
