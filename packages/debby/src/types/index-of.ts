import { KeysMatching } from "@ulthar/typey";
import { ExcludedKeysTypes } from "../entity.js";
import { IndexType } from "./index-type.js";

export type IndexOf<T> = Exclude<KeysMatching<T, IndexType>, ExcludedKeysTypes>;
