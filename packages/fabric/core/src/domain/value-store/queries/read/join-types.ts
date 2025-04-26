import type { Keyof } from "../../../../types/keyof.js";
import type { Model } from "../../../models/model.js";
import type { Infer } from "../../../models/schema.js";

export type TransformedModelKeys<
  TModel,
  TAsKey extends string,
> = `${TAsKey}.${Keyof<TModel>}`;

export type OriginalModelKeys<
  TModel,
  TAsKey extends string,
  TTransformedKey extends string,
> = TTransformedKey extends `${TAsKey}.${infer TKey}`
  ? TKey extends Keyof<TModel>
    ? TKey
    : never
  : never;

export type JoinedModel<TModel extends Model, TAsKey extends string> = {
  [key in TransformedModelKeys<
    Infer<TModel>,
    TAsKey
  >]: Infer<TModel>[OriginalModelKeys<Infer<TModel>, TAsKey, key>];
};

export interface JoinOptions<TModel extends Model, T, TAsKey> {
  model: TModel;
  as: TAsKey;
  on: {
    left: Keyof<T>;
    right: Keyof<Infer<TModel>>;
  };
}
