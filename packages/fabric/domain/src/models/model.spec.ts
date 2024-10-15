import { describe, expectTypeOf, it } from "vitest";
import { UUID } from "../types/uuid.js";
import { Field } from "./fields/index.js";
import { defineModel, ModelToType } from "./model.js";

describe("CreateModel", () => {
  it("should create a model and it's interface type", () => {
    const User = defineModel("User", {
      name: Field.string(),
      password: Field.string(),
      phone: Field.string({ isOptional: true }),
    });
    type User = ModelToType<typeof User>;

    expectTypeOf<User>().toEqualTypeOf<{
      id: UUID;
      streamId: UUID;
      streamVersion: bigint;
      name: string;
      password: string;
      phone: string | null;
    }>();
  });
});
