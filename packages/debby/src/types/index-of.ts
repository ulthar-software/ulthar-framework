import { KeysMatching } from "@ulthar/typey";
import { IndexType } from "./index-type.js";

export type IndexOf<T> = Exclude<KeysMatching<T, IndexType>, "id">;
