import { describe, expect, it } from "@fabric/testing";

import { fieldParsers, InvalidFieldTypeError } from "./field-parsers.js";
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
});
