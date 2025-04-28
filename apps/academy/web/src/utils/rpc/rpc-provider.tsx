/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { JSONExt, Result, UnexpectedError } from "@fabric/core";
import { deserializeError, DomainUseCases } from "@ulthar/academy-domain";
import type { PropsWithChildren } from "react";
import { LOCAL_STORAGE_TOKEN_KEY } from "../auth/auth-provider.tsx";
import { useEnv } from "../env/use-env.ts";
import type { RpcClient } from "./rpc-context.ts";
import { RpcProvider } from "./rpc-context.ts";

export function ConcreteRpcProvider({ children }: PropsWithChildren) {
  const API_URL = useEnv("API_URL");
  return <RpcProvider value={buildClient(API_URL)}>{children}</RpcProvider>;
}

function buildClient(host: string): RpcClient {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);

  if (token) {
    headers.Authorization = token;
  }
  return Object.fromEntries(
    DomainUseCases.map((useCase) => {
      return [
        useCase.name,
        async (input: any = {}) => {
          try {
            const response = await fetch(`${host}/${useCase.name}`, {
              method: useCase.type === "query" ? "GET" : "POST",
              headers: headers,
              body:
                useCase.type === "command" ? JSON.stringify(input) : undefined,
            });
            const textResult = await response.text();
            const result = JSONExt.parse<any>(textResult).unwrapOrThrow();
            if (!response.ok) {
              return Result.failWith(deserializeError(result));
            }
            return Result.ok(result);
          } catch (e: any) {
            console.log(e);
            return Result.failWith(new UnexpectedError(e.message));
          }
        },
      ];
    }),
  ) as unknown as RpcClient;
}
