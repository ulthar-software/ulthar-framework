// deno-lint-ignore-file no-explicit-any
import type { TaggedError } from "@fabric/core";
import type { DomainEvent } from "../events/event.ts";
import type { UseCase } from "./use-case.ts";

export type Command<
  TDependencies = any,
  TPayload = any,
  TEvent extends DomainEvent = any,
  TErrors extends TaggedError<string> = any,
> = BasicCommandDefinition<
  TDependencies,
  TPayload,
  TEvent,
  TErrors
>;

interface BasicCommandDefinition<
  TDependencies,
  TPayload,
  TEvent extends DomainEvent,
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
  useCase: UseCase<TDependencies, TPayload, TEvent, TErrors>;
}
