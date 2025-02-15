/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TaggedError } from "../../error/tagged-error.js";
import type { UseCase } from "./use-case.js";

export type Command<
  TPermissions extends string,
  TDependencies = any,
  TPayload = any,
  TOutput = any,
  TErrors extends TaggedError = any,
> = BasicCommandDefinition<
  TPermissions,
  TDependencies,
  TPayload,
  TOutput,
  TErrors
>;

interface BasicCommandDefinition<
  TPermissions extends string,
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
  permissions?: TPermissions[];

  /**
   * The use case function.
   */
  useCase: UseCase<TDependencies, TPayload, TOutput, TErrors>;
}
