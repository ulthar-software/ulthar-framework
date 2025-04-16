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
      const result = fieldParsers.EmbeddedField(
        Field.embedded({
          subModel: {
            name: Field.string(),
            someExpectedProperty: Field.string(),
          },
          isOptional: true,
        }),
        { name: "test", someExpectedProperty: "test" },
      );

      expect(result.unwrapOrThrow()).toEqual({
        name: "test",
        someExpectedProperty: "test",
      });
    });

    it("should return an error if a property is missing", () => {
      const result = fieldParsers.EmbeddedField(
        Field.embedded({
          subModel: {
            name: Field.string(),
            someExpectedProperty: Field.string(),
          },
          isOptional: true,
        }),
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
});
