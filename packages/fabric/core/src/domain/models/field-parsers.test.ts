import { describe, expect, it, test } from "@fabric/testing";

import {
  fieldParsers,
  InvalidFieldTypeError,
  MissingRequiredFieldError,
} from "./field-parsers.js";
import { Field } from "./fields.js";

describe("FieldParsers", () => {
  describe("EmbeddedField", () => {
    it("should return a valid result", () => {
      const field = Field.embedded(
        {
          name: Field.string(),
          someExpectedProperty: Field.string(),
        },
        {
          isOptional: true,
        },
      );

      const result = fieldParsers.EmbeddedField(field, {
        name: "test",
        someExpectedProperty: "test",
      });

      expect(result.unwrapOrThrow()).toEqual({
        name: "test",
        someExpectedProperty: "test",
      });
    });

    it("should return an error if a property is missing", () => {
      const result = fieldParsers.EmbeddedField(
        Field.embedded(
          {
            name: Field.string(),
            someExpectedProperty: Field.string(),
          },
          {
            isOptional: true,
          },
        ),
        { name: "test" },
      );

      expect(result.unwrapErrorOrThrow()).toBeInstanceOf(InvalidFieldTypeError);
    });
  });
  describe("StringField", () => {
    test("should parse a string with min length", () => {
      const field = Field.string({ minLength: 3 });
      expect(fieldParsers.StringField(field, "abc").unwrapOrThrow()).toBe(
        "abc",
      );
      expect(
        fieldParsers.StringField(field, "ab").unwrapErrorOrThrow(),
      ).toBeInstanceOf(InvalidFieldTypeError);
      expect(
        fieldParsers.StringField(field, "").unwrapErrorOrThrow(),
      ).toBeInstanceOf(InvalidFieldTypeError);
      expect(
        fieldParsers.StringField(field, undefined).unwrapErrorOrThrow(),
      ).toBeInstanceOf(MissingRequiredFieldError);
    });
  });
  describe("ArrayField", () => {
    it("should parse arrays of simple types", () => {
      const field = Field.array(Field.string());
      const result = fieldParsers.ArrayField(field, ["one", "two", "three"]);
      expect(result.unwrapOrThrow()).toEqual(["one", "two", "three"]);
    });

    it("should validate each item in the array", () => {
      const field = Field.array(Field.integer({ isUnsigned: true }));
      const validResult = fieldParsers.ArrayField(field, [1, 2, 3]);
      expect(validResult.unwrapOrThrow()).toEqual([1, 2, 3]);

      const invalidResult = fieldParsers.ArrayField(field, [1, -2, 3]);
      expect(invalidResult.unwrapErrorOrThrow()).toBeInstanceOf(
        InvalidFieldTypeError,
      );
    });

    it("should handle optional arrays", () => {
      const field = Field.array(Field.string(), { isOptional: true });

      // Valid array
      const validResult = fieldParsers.ArrayField(field, ["test"]);
      expect(validResult.unwrapOrThrow()).toEqual(["test"]);

      // Undefined is acceptable for optional fields
      const undefinedResult = fieldParsers.ArrayField(field, undefined);
      expect(undefinedResult.unwrapOrThrow()).toBeUndefined();

      // Non-array values should fail
      const invalidResult = fieldParsers.ArrayField(field, "not an array");
      expect(invalidResult.unwrapErrorOrThrow()).toBeInstanceOf(
        InvalidFieldTypeError,
      );
    });

    it("should require non-optional arrays", () => {
      const field = Field.array(Field.string());
      const result = fieldParsers.ArrayField(field, undefined);
      expect(result.unwrapErrorOrThrow()).toBeInstanceOf(
        MissingRequiredFieldError,
      );
    });

    it("should work with complex typed items", () => {
      const field = Field.array(
        Field.embedded({
          name: Field.string(),
          age: Field.integer(),
        }),
      );

      const validData = [
        { name: "John", age: 25 },
        { name: "Jane", age: 30 },
      ];

      const result = fieldParsers.ArrayField(field, validData);
      expect(result.unwrapOrThrow()).toEqual(validData);
    });
  });
});
