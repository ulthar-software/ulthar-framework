import { describe, expect, it, test } from "@fabric/testing";
import { Field } from "./fields.js";
import { Schema, SchemaParsingError } from "./schema.js";

describe("Schema", () => {
  test("should parse valid data correctly", () => {
    const User = new Schema({
      id: Field.uuid({ isPrimaryKey: true }),
      name: Field.string({}),
      password: Field.string({}),
      phone: Field.string({ isOptional: true }),
    });

    const result = User.parse({
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
    const User = new Schema({
      id: Field.uuid({ isPrimaryKey: true }),
      name: Field.string({}),
      password: Field.string({}),
      phone: Field.string({ isOptional: true }),
    });

    const result = User.parse({
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

  it("should parse a model with embedded fields", () => {
    const User = new Schema({
      id: Field.uuid({ isPrimaryKey: true }),
      name: Field.string({}),
      password: Field.string({}),
      phone: Field.string({ isOptional: true }),
      address: Field.embedded({
        subModel: {
          street: Field.string({}),
          city: Field.string({}),
          state: Field.string({}),
          zip: Field.string({}),
        },
      }),
    });

    const result = User.parse({
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "John Doe",
      password: "password123",
      phone: "123-456-7890",
      address: {
        street: "123 Main St",
        city: "Anytown",
        state: "NY",
        zip: "12345",
      },
    });

    const value = result.unwrapOrThrow();

    expect(value).toEqual({
      // Updated to use 'value' instead of calling unwrapOrThrow() again
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "John Doe",
      password: "password123",
      phone: "123-456-7890",
      address: {
        street: "123 Main St",
        city: "Anytown",
        state: "NY",
        zip: "12345",
      },
    });
  });
});
