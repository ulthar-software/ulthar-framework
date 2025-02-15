import type { Policy } from "@fabric/core";
import type { Permission } from "./permission.js";
import type { UserType } from "./users.js";

export const policy = {
  CREATE_PROJECT: ["ADMIN"],
} as const satisfies Policy<UserType, Permission>;
