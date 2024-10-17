import { describe, expectTypeOf, test } from "@fabric/testing";
import type { PosixDate } from "../../core/index.ts";
import type { UUID } from "../types/uuid.ts";
import { defineAggregateModel } from "./aggregate-model.ts";
import { Field } from "./fields/index.ts";
import type { ModelToType } from "./model.ts";

describe("CreateModel", () => {
  test("should create a model and it's interface type", () => {
    const User = defineAggregateModel("User", {
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
      deletedAt: PosixDate | null;
    }>();
  });
});
