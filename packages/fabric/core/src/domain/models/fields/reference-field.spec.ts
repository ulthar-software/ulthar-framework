import { describe, expect, it } from "vitest";
import { isError } from "../../../error/is-error.js";
import { defineModel } from "../model.js";
import { Field } from "./index.js";
import {
  InvalidReferenceField,
  validateReferenceField,
} from "./reference-field.js";

describe("Validate Reference Field", () => {
  const schema = {
    user: defineModel({
      name: Field.string(),
      password: Field.string(),
      phone: Field.string({ isOptional: true }),
      otherUnique: Field.integer({ isUnique: true }),
      otherNotUnique: Field.uuid(),
    }),
  };

  it("should return an error when the target model is not in the schema", () => {
    const result = validateReferenceField(
      schema,
      "post",
      "authorId",
      Field.reference({
        model: "foo",
      }),
    );

    if (!isError(result)) {
      throw "Expected an error";
    }

    expect(result).toBeInstanceOf(InvalidReferenceField);
    expect(result.toString()).toBe(
      "InvalidReferenceField: post.authorId. The target model 'foo' is not in the schema.",
    );
  });

  it("should not return an error if the target model is in the schema", () => {
    const result = validateReferenceField(
      schema,
      "post",
      "authorId",
      Field.reference({
        model: "user",
      }),
    );

    if (isError(result)) {
      throw result.toString();
    }
  });

  it("should return an error if the target key is not in the target model", () => {
    const result = validateReferenceField(
      schema,
      "post",
      "authorId",
      Field.reference({
        model: "user",
        targetKey: "foo",
      }),
    );

    if (!isError(result)) {
      throw "Expected an error";
    }

    expect(result).toBeInstanceOf(InvalidReferenceField);
    expect(result.toString()).toBe(
      "InvalidReferenceField: post.authorId. The target key 'foo' is not in the target model 'user'.",
    );
  });

  it("should not return an error if the target key is in the target model", () => {
    const result = validateReferenceField(
      schema,
      "post",
      "authorId",
      Field.reference({
        model: "user",
        targetKey: "otherUnique",
      }),
    );

    if (isError(result)) {
      throw result.toString();
    }
  });

  it("should return error if the target key is not unique", () => {
    const result = validateReferenceField(
      schema,
      "post",
      "authorId",
      Field.reference({
        model: "user",
        targetKey: "otherNotUnique",
      }),
    );

    if (!isError(result)) {
      throw "Expected an error";
    }

    expect(result).toBeInstanceOf(InvalidReferenceField);
    expect(result.toString()).toBe(
      "InvalidReferenceField: post.authorId. The target key 'user'.'otherNotUnique' is not unique.",
    );
  });
});
