import type { Query } from "@fabric/core";
import type { Permission } from "./security/permission.js";

export const UseCases = [] as const satisfies Query<Permission>[];

export type UseCases = typeof UseCases;
