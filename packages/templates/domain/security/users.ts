import { EnumToType } from "@fabric/core";

/**
 * A User Type is a string that represents a user type.
 * It should be in uppercase and singular form.
 */
export const UserType = {
  // ADMIN: "ADMIN",
  // SPECIAL_USER: "SPECIAL_USER",
};
export type UserType = EnumToType<typeof UserType>;
