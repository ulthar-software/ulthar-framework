/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { JSONExt, Result, UnexpectedError } from "@fabric/core";
import { registerDefaultTransformers } from "@fabric/core/default-json-transformers";
import {
  deserializeError,
  DomainUseCases,
  ExpiredTokenError,
  InvalidTokenError,
} from "@ulthar/academy-domain";
import type { PropsWithChildren } from "react";
import { LOCAL_STORAGE_TOKEN_KEY } from "../auth/auth-provider.tsx";
import { useAuthLogout } from "../auth/use-auth-logout.ts";
import { useEnv } from "../env/use-env.ts";
import type { RpcClient } from "./rpc-context.ts";
import { RpcProvider } from "./rpc-context.ts";

registerDefaultTransformers();

export function ConcreteRpcProvider({ children }: PropsWithChildren) {
  const API_URL = useEnv("API_URL");
  const logout = useAuthLogout();
  return (
    <RpcProvider value={buildClient(API_URL, logout)}>{children}</RpcProvider>
  );
}

function buildClient(host: string, logout: () => void): RpcClient {
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
            let url = `${host}/${useCase.name}`;
            if (useCase.type === "query" && Object.keys(input).length > 0) {
              const queryParams: Record<string, string> = Object.fromEntries(
                Object.entries(input)
                  .filter(([, v]) => v)
                  .map(([k, v]) => [k, String(v)]),
              );
              const params = new URLSearchParams(queryParams).toString();
              if (params.length > 0) {
                url += `?${params}`;
              }
            }
            const response = await fetch(url, {
              method: useCase.type === "query" ? "GET" : "POST",
              headers: headers,
              body:
                useCase.type === "command" ? JSON.stringify(input) : undefined,
            });
            const textResult = await response.text();
            if (response.ok && !textResult) {
              return Result.ok(undefined);
            }
            const result = JSONExt.parse<any>(textResult).unwrapOrThrow();
            if (!response.ok) {
              const error = deserializeError(result);
              if (
                error instanceof InvalidTokenError ||
                error instanceof ExpiredTokenError
              ) {
                logout();
              }
              return Result.failWith(error);
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
