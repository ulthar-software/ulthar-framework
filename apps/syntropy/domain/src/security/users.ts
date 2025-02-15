import type { EnumToType } from "@fabric/core";

/**
 * A User Type is a string that represents a user type.
 * It should be in uppercase and singular form.
 */
export const UserType = {
  ADMIN: "ADMIN",
  BASE_USER: "BASE_USER",
  // SPECIAL_USER: "SPECIAL_USER",
} as const;

export const UserTypeValues = Object.values(UserType);

export type UserType = EnumToType<typeof UserType>;
