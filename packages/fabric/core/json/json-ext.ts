import { TaggedError } from "../error/tagged-error.ts";
import { UnexpectedError } from "../error/unexpected-error.ts";
import { isRecord } from "../record/is-record.ts";
import { Result } from "../result/result.ts";
import {
  JSONScalar,
  JSONSerializedType,
  JSONTypeTransformer,
} from "./json-transformer.ts";

export const JSONExt = {
  parse<T>(json: string): Result<T, JSONParsingError> {
    try {
      return Result.ok(JSON.parse(json, reviver));
      // deno-lint-ignore no-explicit-any
    } catch (e: any) {
      return Result.failWith(new JSONParsingError(e.message));
    }
  },

  stringify<T>(value: T): Result<string, JSONStringifyError> {
    try {
      return Result.ok(JSON.stringify(value, replacer));
      // deno-lint-ignore no-explicit-any
    } catch (e: any) {
      return Result.failWith(new JSONStringifyError(e.message));
    }
  },

  registerTransformer<TKey extends string, TScalar extends JSONScalar, TType>(
    transformer: JSONTypeTransformer<TKey, TScalar, TType>,
  ) {
    if (transformers.has(transformer._type)) {
      throw new UnexpectedError(
        `Transformer with type ${transformer._type} already registered`,
      );
    }
    transformers.set(transformer._type, transformer);
  },
};

export function reviver(_key: string, value: unknown) {
  if (isJSONSerializedType(value)) {
    const transformer = transformers.get(value._type);
    if (!transformer) {
      throw new Error(`No transformer for type ${value._type}`);
    }
    return transformer.deserialize(value.value);
  }
  return value;
}

// deno-lint-ignore no-explicit-any
export function replacer(_key: string, value: any) {
  for (const transformer of transformers.values()) {
    if (transformer.typeMatches(value)) {
      return transformer.serialize(value);
    }
  }
  return value;
}

function isJSONSerializedType(
  value: unknown,
): value is JSONSerializedType {
  return isRecord(value) && typeof value._type === "string";
}

const transformers: Map<
  string,
  // deno-lint-ignore no-explicit-any
  JSONTypeTransformer<string, JSONScalar, any>
> = new Map();

export class JSONParsingError extends TaggedError<"JSONParsingError"> {
  constructor(message: string) {
    super("JSONParsingError", message);
  }
}
export class JSONStringifyError extends TaggedError<"JSONStringifyError"> {
  constructor(message: string) {
    super("JSONStringifyError", message);
  }
}
