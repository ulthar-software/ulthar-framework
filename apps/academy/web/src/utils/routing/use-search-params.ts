import type { Infer, Schema, SchemaParsingError } from "@fabric/core";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { showErrorToast } from "../toasts/show-error-toast.ts";

interface OnErrorOptions {
  navigateTo?: string;
  message?: string;
}

export function createParsedSearchParams<TSchema extends Schema>(
  schema: TSchema,
  onError?: OnErrorOptions,
): () => [boolean, Infer<TSchema>, SchemaParsingError<TSchema> | undefined] {
  return () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [state, setState] = useState({
      isLoading: true,
      error: undefined as SchemaParsingError<TSchema> | undefined,
      parsedParams: {} as Infer<TSchema>,
    });

    useEffect(() => {
      const parsedParams = schema.parse(
        Object.fromEntries(searchParams.entries()),
      );
      if (parsedParams.isError()) {
        setState((oldState) => ({
          ...oldState,
          isLoading: false,
          error: parsedParams.unwrapErrorOrThrow(),
        }));
        if (onError?.navigateTo) {
          void navigate(onError.navigateTo);
        }
        if (onError?.message) {
          showErrorToast(onError.message);
        }
        return;
      }
      setState((oldState) => ({
        ...oldState,
        isLoading: false,
        error: undefined,
        parsedParams: parsedParams.unwrapOrThrow(),
      }));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    return [state.isLoading, state.parsedParams, state.error] as const;
  };
}
