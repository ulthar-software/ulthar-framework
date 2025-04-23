import type { Infer, Result, Schema, SchemaParsingError } from "@fabric/core";
import type { PropsWithChildren } from "react";
import { useState } from "react";
import type { FormState } from "./form-context.ts";
import { FormContext } from "./form-context.ts";

export interface FormProps<TSchema extends Schema> {
  schema: TSchema;
  onSubmit: (value: Infer<TSchema>) => Promise<void>;
  initialValue?: Infer<TSchema>;
  className?: string;
  cleanAfterSubmit?: boolean;
}

/**
 * The form component is a wrapper for the form elements and
 * provides a context for the form controls.
 */
export function Form<TSchema extends Schema>({
  initialValue,
  schema,
  children,
  onSubmit,
  cleanAfterSubmit = false,
  className = "",
}: PropsWithChildren<FormProps<TSchema>>) {
  const [formState, setFormState] = useState<FormState<TSchema>>({
    isTouched: false,
    isLoading: false,
    value: initialValue ?? ({} as Infer<TSchema>),
  });

  async function onFormSubmit(evt: React.FormEvent) {
    evt.preventDefault();

    setFormState((oldFormState) => {
      return {
        ...oldFormState,
        isTouched: true,
        isLoading: true,
      };
    });

    const result = schema.parse(formState.value);

    if (result.isError()) {
      console.error(result.value);
      return;
    }

    if (result.isOk()) {
      await onSubmit(result.value);
    }

    if (cleanAfterSubmit) {
      setFormState((oldFormState) => {
        return {
          ...oldFormState,
          isTouched: false,
          isLoading: false,
          value: initialValue ?? ({} as Infer<TSchema>),
        };
      });
    } else {
      setFormState((oldFormState) => {
        return {
          ...oldFormState,
          isTouched: true,
          isLoading: false,
          value: {
            ...oldFormState.value,
            ...getResultValue(result),
          },
        };
      });
    }
  }

  function updateFormValue(
    key: string,
    newValue: Infer<TSchema>[keyof Infer<TSchema>] | undefined,
  ) {
    setFormState((oldFormState) => {
      return {
        ...oldFormState,
        value: {
          ...oldFormState.value,
          [key]: newValue,
        },
      };
    });
  }

  const result = schema.parse(formState.value);
  const errors = result.isError() ? result.value : undefined;

  return (
    <form
      className={`p-4 flex flex-col gap-4 ${className}`}
      onSubmit={(e) => void onFormSubmit(e)}
    >
      <FormContext.Provider
        value={{
          ...formState,
          updateFormValue,
          errors,
        }}
      >
        {children}
      </FormContext.Provider>
    </form>
  );
}

function getResultValue<TSchema extends Schema>(
  result: Result<Infer<TSchema>, SchemaParsingError<TSchema>>,
): Partial<Infer<TSchema>> {
  if (result.isOk()) {
    return result.value;
  }

  if (result.isError()) {
    return {
      ...result.value.value,
    };
  }

  return {};
}
