import { Decimal } from "../decimal/decimal.js";
import { posixDateTransformer } from "../time/posix-date.js";
import { JSONExt } from "./json-ext.js";

export function registerDefaultTransformers() {
  JSONExt.registerTransformer({
    _type: "bigint",
    deserialize: (value: unknown) => {
      if (typeof value !== "string") {
        throw new Error(
          "BigInt value must be a string with the numeric representation",
        );
      }
      return BigInt(value);
    },
    serialize: (value: bigint) => ({
      _type: "bigint",
      value: value.toString(),
    }),
    typeMatches: (value: unknown) => typeof value === "bigint",
  });

  JSONExt.registerTransformer({
    _type: "decimal",
    deserialize: (value: unknown) => {
      if (typeof value !== "string") {
        throw new Error(
          "Decimal value must be a string with the numeric representation",
        );
      }
      return Decimal.from(value);
    },
    serialize: (value: Decimal) => ({
      _type: "decimal",
      value: value.toString(),
    }),
    typeMatches: (value: unknown) => value instanceof Decimal,
  });

  JSONExt.registerTransformer(posixDateTransformer);
}
