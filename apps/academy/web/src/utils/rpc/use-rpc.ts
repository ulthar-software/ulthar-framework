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
  return rpc[name];
}
