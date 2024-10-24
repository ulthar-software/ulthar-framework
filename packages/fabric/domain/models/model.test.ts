import { describe, expect, test } from "@fabric/testing";
import { Field } from "./fields.ts";
import { Model, type ModelToType, SchemaParsingError } from "./model.ts";

describe("CreateModel", () => {
  test("should create a model and it's interface type", () => {
    const User = Model.aggregateFrom("User", {
      name: Field.string(),
      password: Field.string(),
      phone: Field.string({ isOptional: true }),
    });
    type User = ModelToType<typeof User>;

    // expectTypeOf<User>().toEqualTypeOf<{
    //   id: UUID;
    //   streamId: UUID;
    //   streamVersion: bigint;
    //   name: string;
    //   password: string;
    //   phone?: string | undefined;
    //   deletedAt?: PosixDate | undefined;
    // }>();

    // deno-lint-ignore no-unused-vars
    const p: User = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      streamId: "123e4567-e89b-12d3-a456-426614174001",
      streamVersion: 1n,
      name: "John Doe",
      password: "password123",
    };
  });

  test("should parse valid data correctly", () => {
    const User = Model.aggregateFrom("User", {
      name: Field.string(),
      password: Field.string(),
      phone: Field.string({ isOptional: true }),
    });

    const result = User.parse({
      id: "123e4567-e89b-12d3-a456-426614174000",
      streamId: "123e4567-e89b-12d3-a456-426614174001",
      streamVersion: 1n,
      name: "John Doe",
      password: "password123",
      phone: "123-456-7890",
    });

    expect(result.unwrapOrThrow()).toEqual({
      id: "123e4567-e89b-12d3-a456-426614174000",
      streamId: "123e4567-e89b-12d3-a456-426614174001",
      streamVersion: 1n,
      name: "John Doe",
      password: "password123",
      phone: "123-456-7890",
    });
  });

  test("should fail to parse invalid data", () => {
    const User = Model.aggregateFrom("User", {
      name: Field.string(),
      password: Field.string(),
      phone: Field.string({ isOptional: true }),
    });

    const result = User.parse({
      id: "invalid-uuid",
      streamId: "invalid-uuid",
      streamVersion: "not-a-bigint",
      name: 123,
      password: true,
      phone: 456,
      deletedAt: "not-a-date",
    });

    expect(result.isError()).toBe(true);
    if (result.isError()) {
      const error = result.unwrapErrorOrThrow();
      expect(error).toBeInstanceOf(SchemaParsingError);
      expect(error.errors).toHaveProperty("id");
      expect(error.errors).toHaveProperty("streamId");
      expect(error.errors).toHaveProperty("streamVersion");
      expect(error.errors).toHaveProperty("name");
      expect(error.errors).toHaveProperty("password");
      expect(error.errors).toHaveProperty("deletedAt");
    }
  });
});
