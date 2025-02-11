/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TaggedError } from "@fabric/core";
import type { UseCase } from "./use-case.js";

export type Query<
  TDependencies = any,
  TPayload = any,
  TOutput = any,
  TErrors extends TaggedError = any,
> = BasicQueryDefinition<TDependencies, TPayload, TOutput, TErrors>;

interface BasicQueryDefinition<
  TDependencies,
  TPayload,
  TOutput,
  TErrors extends TaggedError,
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
