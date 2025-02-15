import type { Command, DomainEvent, TaggedError } from "@fabric/core";
import type { Permission } from "../security/permission.js";

export type DomainCommand<
  TDependencies,
  TPayload,
  TEvent extends DomainEvent,
  TErrors extends TaggedError,
> = Command<Permission, TDependencies, TPayload, TEvent, TErrors>;
