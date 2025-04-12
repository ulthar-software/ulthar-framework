import type { Command, TaggedError } from "@fabric/core";
import type { Permission } from "../security/permission.js";

export type DomainCommand<
  TDependencies,
  TPayload,
  TEvent,
  TErrors extends TaggedError,
> = Command<Permission, TDependencies, TPayload, TEvent, TErrors>;
