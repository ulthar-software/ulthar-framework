import { Field, ModelToType } from "@fabric/models";
import { describe, test } from "@fabric/testing";
import { PosixDate, UUID } from "../core/index.ts";
import { Aggregate } from "./aggregate.ts";

describe("Aggregate", () => {
  test("Creating an aggregate generates the correct typings", () => {
    const TestAggregate = new Aggregate("Name", {
      test: Field.boolean({}),
    });
    type TestAggregate = ModelToType<typeof TestAggregate>;

    interface ExpectedType {
      readonly id: UUID;
      readonly streamVersion: bigint;
      readonly test: boolean;
      readonly createdAt: PosixDate;
      readonly updatedAt: PosixDate;
      readonly deletedAt?: PosixDate | undefined;
    }

    let a: ExpectedType = {
      id: crypto.randomUUID() as UUID,
      streamVersion: 0n,
      test: false,
      createdAt: new PosixDate(),
      updatedAt: new PosixDate(),
      deletedAt: undefined,
    };

    let b: TestAggregate = {
      id: crypto.randomUUID() as UUID,
      streamVersion: 0n,
      test: false,
      createdAt: new PosixDate(),
      updatedAt: new PosixDate(),
      deletedAt: undefined,
    };

    a = b;
    b = a;
  });
});
