import { AlternativeType } from "./alternative-types.js";

export type SearchCondition<T> = AlternativeType<T> | T;
