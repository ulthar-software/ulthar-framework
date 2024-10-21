import { isError } from "@fabric/core";
import { describe, expect, test } from "@fabric/testing";
import { Model } from "../model.ts";
import { Field } from "./index.ts";
import {
  InvalidReferenceFieldError,
  validateReferenceField,
} from "./reference-field.ts";

describe("Validate Reference Field", () => {
  const schema = {
    User: Model.aggregateFrom("User", {
      name: Field.string(),
      password: Field.string(),
      otherUnique: Field.integer({ isUnique: true }),
      otherNotUnique: Field.uuid(),
      otherUser: Field.reference({
        targetModel: "User",
      }),
    }),
  };

  test("should return an error when the target model is not in the schema", () => {
    const result = validateReferenceField(
      schema,
      Field.reference({
        targetModel: "foo",
      }),
    ).unwrapErrorOrThrow();

    expect(result).toBeInstanceOf(InvalidReferenceFieldError);
  });

  test("should not return an error if the target model is in the schema", () => {
    validateReferenceField(
      schema,
      Field.reference({
        targetModel: "User",
      }),
    ).unwrapOrThrow();
  });

  test("should return an error if the target key is not in the target model", () => {
    const result = validateReferenceField(
      schema,
      Field.reference({
        targetModel: "User",
        targetKey: "foo",
      }),
    ).unwrapErrorOrThrow();

    expect(result).toBeInstanceOf(InvalidReferenceFieldError);
  });

  test("should return error if the target key is not unique", () => {
    const result = validateReferenceField(
      schema,
      Field.reference({
        targetModel: "User",
        targetKey: "otherNotUnique",
      }),
    ).unwrapErrorOrThrow();

    expect(result).toBeInstanceOf(InvalidReferenceFieldError);
  });

  test("should not return an error if the target key is in the target model and is unique", () => {
    const result = validateReferenceField(
      schema,
      Field.reference({
        targetModel: "User",
        targetKey: "otherUnique",
      }),
    );

    if (isError(result)) {
      throw result.toString();
    }
  });
});
