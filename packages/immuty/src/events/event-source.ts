import { Result, TaggedError } from "../index.js";

export type EventSource<A, AErr extends TaggedError> = AsyncIterable<
    Result<A, AErr>
>;
