import { Decimal } from "../decimal/decimal.js";
import { posixDateTransformer } from "../time/posix-date.js";
import { JSONExt } from "./json-ext.js";

export function registerDefaultTransformers() {
  JSONExt.registerTransformer({
    _type: "bigint",
    deserialize: (value: string) => BigInt(value),
    serialize: (value: bigint) => ({
      _type: "bigint",
      value: value.toString(),
    }),
    typeMatches: (value: unknown) => typeof value === "bigint",
  });

  JSONExt.registerTransformer({
    _type: "decimal",
    deserialize: (value: string) => Decimal.from(value),
    serialize: (value: Decimal) => ({
      _type: "decimal",
      value: value.toString(),
    }),
    typeMatches: (value: unknown) => value instanceof Decimal,
  });

  JSONExt.registerTransformer(posixDateTransformer);
}
