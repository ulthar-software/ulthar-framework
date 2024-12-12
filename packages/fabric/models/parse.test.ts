import { describe, expect, test } from "@fabric/testing";
import { Field } from "./fields.ts";
import { Model } from "./model.ts";
import { parse, SchemaParsingError } from "./parse.ts";

describe("Parsing Models", () => {
  test("should parse valid data correctly", () => {
    const User = Model.from("User", {
      id: Field.uuid({ isPrimaryKey: true }),
      name: Field.string({}),
      password: Field.string({}),
      phone: Field.string({ isOptional: true }),
    });

    const result = parse(User, {
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "John Doe",
      password: "password123",
      phone: "123-456-7890",
    });

    expect(result.unwrapOrThrow()).toEqual({
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "John Doe",
      password: "password123",
      phone: "123-456-7890",
    });
  });

  test("should fail to parse invalid data", () => {
    const User = Model.from("User", {
      id: Field.uuid({ isPrimaryKey: true }),
      name: Field.string({}),
      password: Field.string({}),
      phone: Field.string({ isOptional: true }),
    });

    const result = parse(User, {
      id: "invalid-uuid",
      name: 123,
      password: true,
      phone: 456,
      deletedAt: "not-a-date",
    });

    expect(result.isError()).toBe(true);
    if (!result.isError()) throw new Error("Expected error");

    const error = result.unwrapErrorOrThrow();
    expect(error).toBeInstanceOf(SchemaParsingError);
    expect(error.value).toEqual({});
    expect(error.errors).toHaveProperty("id");
    expect(error.errors).toHaveProperty("name");
    expect(error.errors).toHaveProperty("password");
    expect(error.errors).toHaveProperty("phone");
  });
});
