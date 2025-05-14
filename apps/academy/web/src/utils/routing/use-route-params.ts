import type { Infer, Schema } from "@fabric/core";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";

export function useParsedRouteParams<TSchema extends Schema>(
  schema: TSchema,
  navigateTo: string,
): Infer<TSchema> {
  const params = useParams();
  const parsedParams = schema.parse(Object.fromEntries(Object.entries(params)));
  const navigate = useNavigate();

  useEffect(() => {
    if (parsedParams.isError()) {
      void navigate(navigateTo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  return parsedParams.value as Infer<TSchema>;
}
