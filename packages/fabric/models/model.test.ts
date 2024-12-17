import { describe, test } from "@fabric/testing";
import { Field } from "./fields.ts";
import { Model, type ModelToType } from "./model.ts";

describe("CreateModel", () => {
  test("given a valid Model, it should create a model and it's interface type", () => {
    const User = new Model("User", {
      id: Field.uuid({ isPrimaryKey: true }),
      name: Field.string({}),
      password: Field.string({}),
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
      name: "John Doe",
      password: "password123",
    };
  });
});
