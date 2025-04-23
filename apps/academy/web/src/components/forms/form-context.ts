import type { Infer, Schema, SchemaParsingError } from "@fabric/core";
import { createContext } from "react";

export interface FormState<TSchema extends Schema> {
  isTouched: boolean;
  isLoading: boolean;
  value: Infer<TSchema>;
}

export interface FormContext<TSchema extends Schema>
  extends FormState<TSchema> {
  errors?: SchemaParsingError<TSchema>;
  updateFormValue(
    name: string,
    value: Infer<TSchema>[keyof Infer<TSchema>],
  ): void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const FormContext = createContext<FormContext<any>>({
  isTouched: false,
  isLoading: false,
  value: {},
  errors: undefined,
  updateFormValue: () => void 0,
});
