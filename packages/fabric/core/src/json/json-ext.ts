/* eslint-disable @typescript-eslint/no-unnecessary-type-parameters */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import type {
  Model,
  ModelToType,
  SchemaParsingError,
} from "../domain/index.js";
import { parseModel } from "../domain/index.js";
import { TaggedError } from "../error/tagged-error.js";
import { UnexpectedError } from "../error/unexpected-error.js";
import { isRecord } from "../record/is-record.js";
import { Result } from "../result/result.js";
import type {
  JSONScalar,
  JSONSerializedType,
  JSONTypeTransformer,
} from "./json-transformer.js";

export const JSONExt = {
  parse<T>(json: string): Result<T, JSONParsingError> {
    try {
      return Result.ok(JSON.parse(json, reviver));
    } catch (e: unknown) {
      return Result.failWith(new JSONParsingError((e as Error).message));
    }
  },

  parseWithModel<TModel extends Model>(
    model: TModel,
    json: string,
  ): Result<
    ModelToType<TModel>,
    JSONParsingError | SchemaParsingError<TModel>
  > {
    return this.parse(json).flatMap((parsed) => {
      return parseModel(model, parsed);
    });
  },

  stringify<T>(value: T): Result<string, JSONStringifyError> {
    try {
      return Result.ok(JSON.stringify(value, replacer));
    } catch (e: unknown) {
      return Result.failWith(new JSONStringifyError((e as Error).message));
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

export function replacer(_key: string, value: any) {
  for (const transformer of transformers.values()) {
    if (transformer.typeMatches(value)) {
      return transformer.serialize(value);
    }
  }
  return value;
}

function isJSONSerializedType(value: unknown): value is JSONSerializedType {
  return isRecord(value) && typeof value._type === "string";
}

const transformers = new Map<
  string,
  JSONTypeTransformer<string, JSONScalar, any>
>();

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
