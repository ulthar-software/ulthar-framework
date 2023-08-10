export type ConcatTuple<A, B> = A extends unknown[] ? [...A, B] : [A, B];
