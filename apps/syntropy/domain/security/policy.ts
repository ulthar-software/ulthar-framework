import type { Policy } from "@fabric/domain";
import type { Permission } from "./permission.ts";
import type { UserType } from "./users.ts";

export const policy = {} as const satisfies Policy<UserType, Permission>;
