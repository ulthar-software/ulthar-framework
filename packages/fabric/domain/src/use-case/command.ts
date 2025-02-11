/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TaggedError } from "@fabric/core";
import type { DomainEvent } from "../events/event.js";
import type { UseCase } from "./use-case.js";

export type Command<
  TDependencies = any,
  TPayload = any,
  TEvent extends DomainEvent = any,
  TErrors extends TaggedError = any,
> = BasicCommandDefinition<TDependencies, TPayload, TEvent, TErrors>;

interface BasicCommandDefinition<
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
  permissions?: string[];

  /**
   * The use case function.
   */
  useCase: UseCase<TDependencies, TPayload, TEvent, TErrors>;
}
