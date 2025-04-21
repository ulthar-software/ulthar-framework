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
} as const;
