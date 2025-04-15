import type { EnumToType } from "@fabric/core";

/**
 * A User Type is a string that represents a user type.
 * It should be in uppercase and singular form.
 */
export const UserRole = {
  ADMIN: "ADMIN",
  TEACHER: "TEACHER",
  STUDENT: "STUDENT",
} as const;

export const UserRoleValues = Object.values(UserRole);

export type UserRole = EnumToType<typeof UserRole>;
