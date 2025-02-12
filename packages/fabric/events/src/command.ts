/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TaggedError } from "@fabric/core";
import type { UseCase } from "@fabric/domain";
import type { DomainEvent } from "./event.js";
import type { StoredEvent } from "./stored-event.js";

export type Command<
  TPermissions extends string,
  TDependencies = any,
  TPayload = any,
  TEvent extends DomainEvent = any,
  TErrors extends TaggedError = any,
> = BasicCommandDefinition<
  TPermissions,
  TDependencies,
  TPayload,
  TEvent,
  TErrors
>;

interface BasicCommandDefinition<
  TPermissions extends string,
  TDependencies,
  TPayload,
  TEvent extends DomainEvent,
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
  useCase: UseCase<TDependencies, TPayload, StoredEvent<TEvent>, TErrors>;
}
