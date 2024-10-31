// deno-lint-ignore-file no-explicit-any
import type { TaggedError } from "@fabric/core";
import type { UseCase } from "./use-case.ts";

export type Query<
  TDependencies = any,
  TPayload = any,
  TOutput = any,
  TErrors extends TaggedError<string> = any,
> = BasicQueryDefinition<
  TDependencies,
  TPayload,
  TOutput,
  TErrors
>;

interface BasicQueryDefinition<
  TDependencies,
  TPayload,
  TOutput,
  TErrors extends TaggedError<string>,
> {
  /**
   * The use case name.
   */
  name: string;

  /**
   * Whether the use case requires authentication or not.
   */
  isAuthRequired: boolean;

  /**
   * Permissions required to execute the use case.
   */
  permissions?: string[];

  /**
   * The use case function.
   */
  useCase: UseCase<TDependencies, TPayload, TOutput, TErrors>;
}
