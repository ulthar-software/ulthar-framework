import { Policy } from "@fabric/domain";
import { Permission } from "./permission.js";
import { UserType } from "./users.js";

export const policy = {} as const satisfies Policy<UserType, Permission>;
