import { Policy } from "@fabric/domain";
import { Permission } from "./permission.ts";
import { UserType } from "./users.ts";

export const policy = {} as const satisfies Policy<UserType, Permission>;
