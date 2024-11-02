import { EnumToType } from "@fabric/core";

/**
 * A permission is a string that represents a something that a user is allowed to do in the system. It should be in the form of: `ACTION_ENTITY`.
 *    - `ACTION`: The domain action that the user can perform on the domain object. This is a domain verb in the imperative mood. i.e. "CREATE", "EDIT", "VIEW", "FIX", "RELEASE", etc.
 *    - `ENTITY`: The domain object that the user can perform the action on. This is a domain noun in the singular form.
 */
export const Permission = {} as const;

export type Permission = EnumToType<typeof Permission>;
