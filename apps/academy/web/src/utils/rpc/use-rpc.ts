import { Result, UnexpectedError } from "@fabric/core";
import { useContext } from "react";
import {
  RpcContext,
  type UseCaseNames,
  type UseCaseRPC,
} from "./rpc-context.ts";

export function useRPC<TName extends UseCaseNames>(
  name: TName,
): UseCaseRPC<TName> {
  const rpc = useContext(RpcContext);
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!rpc[name]) {
    return (() =>
      Promise.resolve(
        Result.failWith(new UnexpectedError("RPC method not found")),
      )) as unknown as UseCaseRPC<TName>;
  }
  return rpc[name];
}
