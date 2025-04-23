import type { Result } from "@fabric/core";
import type {
  UseCaseErrorValue,
  UseCaseInput,
  UseCaseOkValue,
} from "@ulthar/academy-domain";
import { useEffect, useState } from "react";
import type { UseCaseFromName, UseCaseNames } from "./rpc-context.ts";
import { useRPC } from "./use-rpc.ts";

export type QueryResult<TName extends UseCaseNames> = [
  boolean, //isLoading
  UseCaseOkValue<UseCaseFromName<TName>> | undefined, //isMaybeOK
  UseCaseErrorValue<UseCaseFromName<TName>> | undefined, //isMaybeError
];

export function useQuery<TName extends UseCaseNames>(
  name: TName,
  input: UseCaseInput<UseCaseFromName<TName>>,
): QueryResult<TName> {
  const rpc = useRPC(name);
  const [state, setState] = useState<QueryResult<TName>>([
    true,
    undefined,
    undefined,
  ]);

  async function callRPC() {
    setState([true, undefined, undefined]);

    const result = (await rpc(input)) as Result<
      UseCaseOkValue<UseCaseFromName<TName>>,
      UseCaseErrorValue<UseCaseFromName<TName>>
    >;

    if (result.isOk()) {
      setState([false, result.value, undefined]);
    } else {
      setState([
        false,
        undefined,
        result.value as UseCaseErrorValue<UseCaseFromName<TName>>,
      ]);
    }
  }

  useEffect(() => {
    void callRPC();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(input)]);

  return state;
}
