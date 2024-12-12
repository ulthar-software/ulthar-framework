export interface JSONTypeTransformer<
  TKey extends string,
  TScalar extends JSONScalar,
  TType,
> {
  _type: TKey;
  deserialize(value: unknown): TType;
  serialize(value: TType): JSONSerializedType<TKey, TScalar>;
  typeMatches(value: unknown): value is TType;
}

export type JSONScalar = string | number | boolean | object | null;

export interface JSONSerializedType<
  TKey extends string = string,
  TScalar extends JSONScalar = JSONScalar,
> {
  _type: TKey;
  value: TScalar;
}
