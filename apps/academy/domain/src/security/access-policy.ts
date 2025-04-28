import type { UseCaseAuth } from "../utils/use-case.js";
import type { Permission } from "./permission.js";

export const AccessPolicy = {
  Anonymous: () => ({
    isAuthRequired: false,
    requiredPermissions: [],
  }),
  Authenticated: () => ({
    isAuthRequired: true,
    requiredPermissions: [],
  }),
  WithPermission: (...perms: Permission[]) => ({
    isAuthRequired: true,
    requiredPermissions: perms,
  }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as const satisfies Record<string, (...args: any) => UseCaseAuth>;
