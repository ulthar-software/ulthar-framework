import { Policy } from "@ulthar/fabric-core";
import { Permission } from "./permission.js";
import { UserType } from "./users.js";

export const policy = {} as const satisfies Policy<UserType, Permission>;
