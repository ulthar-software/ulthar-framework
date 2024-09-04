import { TaggedVariant } from "../../variant/variant.js";

/**
 * An event is a tagged variant with a payload and a timestamp.
 */
export interface Event<TTag extends string, TPayload>
  extends TaggedVariant<TTag> {
  payload: TPayload;
  timestamp: number;
}
