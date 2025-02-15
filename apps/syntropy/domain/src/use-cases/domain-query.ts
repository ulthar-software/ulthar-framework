import type { Query, TaggedError } from "@fabric/core";
import type { Permission } from "../security/permission.js";

export type DomainQuery<
  TDependencies,
  TPayload,
  TOutput,
  TErrors extends TaggedError,
> = Query<Permission, TDependencies, TPayload, TOutput, TErrors>;
