import { JoinResult } from "./join-result.js";

export type ConcatJoinResult<A, B> = (A extends JoinResult ? A : never) &
    (B extends JoinResult ? B : never);
