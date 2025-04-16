import type { EnumToType } from "@fabric/core";
import type { UserRole } from "./user-role.js";

/**
 * A permission is a string that represents a something that a user is allowed to do in the system. It should be in the form of: `ACTION_ENTITY`.
 *    - `ACTION`: The domain action that the user can perform on the domain object. This is a domain verb in the imperative mood. i.e. "CREATE", "EDIT", "VIEW", "FIX", "RELEASE", etc.
 *    - `ENTITY`: The domain object that the user can perform the action on. This is a domain noun in the singular form.
 */
export const Permission = {
  INVITE_USERS: "INVITE_USERS",
  VIEW_COURSE: "VIEW_COURSE",
  CREATE_COURSE: "CREATE_COURSE",
  EDIT_COURSE: "EDIT_COURSE",
  ADD_MODULE_TO_COURSE: "ADD_MODULE_TO_COURSE",
} as const;

export type Permission = EnumToType<typeof Permission>;

export const permissionsByRole: Record<Permission, UserRole[]> = {
  INVITE_USERS: ["ADMIN"],
  VIEW_COURSE: ["ADMIN", "TEACHER", "STUDENT"],
  CREATE_COURSE: ["ADMIN", "TEACHER"],
  EDIT_COURSE: ["ADMIN", "TEACHER"],
  ADD_MODULE_TO_COURSE: ["ADMIN", "TEACHER"],
};

export function getPermissionsForRole(role: UserRole): Permission[] {
  return Object.entries(permissionsByRole)
    .filter(([, roles]) => roles.includes(role))
    .map(([permission]) => permission as Permission);
}
