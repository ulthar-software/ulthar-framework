import { TaggedVariant } from "../../variant/variant.js";

export interface Event<TTag extends string, TPayload>
  extends TaggedVariant<TTag> {
  payload: TPayload;
  timestamp: number;
}
