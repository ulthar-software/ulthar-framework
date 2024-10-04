import { isError } from "@fabric/core";
import { describe, expect, it } from "vitest";
import { defineModel } from "../model.js";
import { Field } from "./index.js";
import {
  InvalidReferenceField,
  validateReferenceField,
} from "./reference-field.js";

describe("Validate Reference Field", () => {
  const schema = {
    User: defineModel("User", {
      name: Field.string(),
      password: Field.string(),
      otherUnique: Field.integer({ isUnique: true }),
      otherNotUnique: Field.uuid(),
      otherUser: Field.reference({
        targetModel: "User",
      }),
    }),
  };

  it("should return an error when the target model is not in the schema", () => {
    const result = validateReferenceField(
      schema,
      Field.reference({
        targetModel: "foo",
      }),
    );

    if (!isError(result)) {
      throw "Expected an error";
    }

    expect(result).toBeInstanceOf(InvalidReferenceField);
  });

  it("should not return an error if the target model is in the schema", () => {
    const result = validateReferenceField(
      schema,
      Field.reference({
        targetModel: "User",
      }),
    );

    if (isError(result)) {
      throw result.reason;
    }
  });

  it("should return an error if the target key is not in the target model", () => {
    const result = validateReferenceField(
      schema,
      Field.reference({
        targetModel: "User",
        targetKey: "foo",
      }),
    );

    if (!isError(result)) {
      throw "Expected an error";
    }

    expect(result).toBeInstanceOf(InvalidReferenceField);
  });

  it("should return error if the target key is not unique", () => {
    const result = validateReferenceField(
      schema,
      Field.reference({
        targetModel: "User",
        targetKey: "otherNotUnique",
      }),
    );

    if (!isError(result)) {
      throw "Expected an error";
    }

    expect(result).toBeInstanceOf(InvalidReferenceField);
  });

  it("should not return an error if the target key is in the target model and is unique", () => {
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
