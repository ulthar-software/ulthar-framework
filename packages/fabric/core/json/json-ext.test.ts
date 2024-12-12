import { beforeAll, describe, expect, test } from "@fabric/testing";
import { Decimal } from "../decimal/decimal.ts";
import { UnexpectedError } from "../error/unexpected-error.ts";
import { PosixDate } from "../time/index.ts";
import { registerDefaultTransformers } from "./default-json-transformers.ts";
import { JSONExt, JSONParsingError, JSONStringifyError } from "./json-ext.ts";

describe("JSONExt", () => {
  beforeAll(() => {
    registerDefaultTransformers();
  });

  test("JSONExt.parse should parse a valid JSON string", () => {
    const jsonString = '{"key": "value"}';
    const result = JSONExt.parse(jsonString);
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOrThrow()).toEqual({ key: "value" });
  });

  test("JSONExt.parse should return a JSONParsingError for an invalid JSON string", () => {
    const jsonString = '{"key": "value"';
    const result = JSONExt.parse(jsonString);
    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(
      JSONParsingError,
    );
  });

  test("JSONExt.stringify should stringify a valid object", () => {
    const obj = { key: "value" };
    const result = JSONExt.stringify(obj);
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOrThrow()).toBe('{"key":"value"}');
  });

  test("JSONExt.stringify should return a JSONStringifyError for a circular object", () => {
    // deno-lint-ignore no-explicit-any
    const obj: any = { key: "value" };
    obj.self = obj;
    const result = JSONExt.stringify(obj);
    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(
      JSONStringifyError,
    );
  });

  test("JSONExt.parse should parse a JSON string with a registered transformer (bigint)", () => {
    const jsonString = '{"_type":"bigint","value":"12345678901234567890"}';
    const result = JSONExt.parse(jsonString);
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOrThrow()).toBe(BigInt("12345678901234567890"));
  });

  test("JSONExt.stringify should stringify an object with a registered transformer (bigint)", () => {
    const obj = BigInt("12345678901234567890");
    const result = JSONExt.stringify(obj);
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOrThrow()).toBe(
      '{"_type":"bigint","value":"12345678901234567890"}',
    );
  });

  test("JSONExt.parse should parse a JSON string with a registered transformer (decimal)", () => {
    const jsonString = '{"_type":"decimal","value":"12345.6789"}';
    const result = JSONExt.parse<Decimal>(jsonString);
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOrThrow().toString()).toBe("12345.6789");
  });

  test("JSONExt.stringify should stringify an object with a registered transformer (decimal)", () => {
    const obj = Decimal.from("12345.6789");
    const result = JSONExt.stringify(obj);
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOrThrow()).toBe(
      '{"_type":"decimal","value":"12345.6789"}',
    );
  });

  test("JSONExt.parse should return a JSONParsingError for an unknown transformer type", () => {
    const jsonString = '{"_type":"unknown","value":"value"}';
    const result = JSONExt.parse(jsonString);
    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(
      JSONParsingError,
    );
    expect(result.unwrapErrorOrThrow().message).toBe(
      "No transformer for type unknown",
    );
  });

  test("JSONExt.parse should parse a JSON string with a registered transformer (posix-date)", () => {
    const jsonString = '{"_type":"posix-date","value":1633072800000}';
    const result = JSONExt.parse<PosixDate>(jsonString);
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOrThrow()).toEqual(new PosixDate(1633072800000));
  });

  test("JSONExt.stringify should stringify an object with a registered transformer (posix-date)", () => {
    const date = new PosixDate(1633072800000);
    const result = JSONExt.stringify(date);
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOrThrow()).toBe(
      '{"_type":"posix-date","value":1633072800000}',
    );
  });

  test("JSONExt.registerTransformer should throw an error when registering a transformer that is already registered", () => {
    const transformer = {
      _type: "duplicate",
      typeMatches: (value: unknown): value is number =>
        typeof value === "number",
      serialize: (value: number) => ({
        _type: "duplicate",
        value: value.toString(),
      }),
      deserialize: (value: string) => parseFloat(value),
    };

    JSONExt.registerTransformer(transformer);

    expect(() => JSONExt.registerTransformer(transformer)).toThrow(
      new UnexpectedError(`Transformer with type duplicate already registered`),
    );
  });
});
