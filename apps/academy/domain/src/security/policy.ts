import type { Policy } from "@fabric/core";
import type { Permission } from "./permission.js";
import type { UserRole } from "./user-role.js";

export const permissionsByRole: Policy<UserRole, Permission> = {
  INVITE_STUDENT: ["ADMIN"],
  VIEW_COURSE: ["ADMIN", "TEACHER", "STUDENT"],
};

export function getPermissionsForRole(role: UserRole): Permission[] {
  return Object.entries(permissionsByRole)
    .filter(([, roles]) => roles.includes(role))
    .map(([permission]) => permission as Permission);
}
