// deno-lint-ignore-file no-explicit-any
import type { TaggedError } from "@fabric/core";
import type { UseCase } from "../domain/use-case/use-case.ts";
import type { DomainEvent } from "./event.ts";

export type Command<
  TDependencies = any,
  TPayload = any,
  TEvent extends DomainEvent = any,
  TErrors extends TaggedError<string> = any,
  TPermissions extends string = string,
> = BasicCommandDefinition<
  TDependencies,
  TPayload,
  TEvent,
  TErrors,
  TPermissions
>;

interface BasicCommandDefinition<
  TDependencies,
  TPayload,
  TEvent extends DomainEvent,
  TErrors extends TaggedError<string>,
  TPermissions extends string,
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
  useCase: UseCase<TDependencies, TPayload, TEvent, TErrors>;
}
