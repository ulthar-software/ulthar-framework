import type { UseCaseAuth } from "../utils/use-case.js";
import type { Permission } from "./permission.js";

export const AccessPolicy = {
  ANONYMOUS: () => ({
    isAuthRequired: false,
    requiredPermissions: [],
  }),
  LoggedIn: () => ({
    isAuthRequired: true,
    requiredPermissions: [],
  }),
  WithPermission: (perm: Permission) => ({
    isAuthRequired: true,
    requiredPermissions: [perm],
  }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as const satisfies Record<string, (...args: any) => UseCaseAuth>;
