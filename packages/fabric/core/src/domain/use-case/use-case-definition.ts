/* eslint-disable @typescript-eslint/no-explicit-any */
import { TaggedError } from "../../error/tagged-error.js";
import { UseCase } from "./use-case.js";

export type UseCaseDefinition<
  TDependencies = any,
  TPayload = any,
  TOutput = any,
  TErrors extends TaggedError<string> = any,
> = BasicUseCaseDefinition<TDependencies, TPayload, TOutput, TErrors>;

interface BasicUseCaseDefinition<
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
   * The use case function.
   */
  useCase: UseCase<TDependencies, TPayload, TOutput, TErrors>;
}
