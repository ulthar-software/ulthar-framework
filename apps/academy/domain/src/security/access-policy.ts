import type { Permission } from "./permission.js";

export const AccessPolicy = {
  ANONYMOUS: () => ({
    isAuthRequired: false,
    requiredPermissions: [],
  }),
  WithPermission: (perm: Permission) => ({
    isAuthRequired: true,
    requiredPermissions: [perm],
  }),
} as const;
