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
  WithPermission: (perm: Permission, ...perms: Permission[]) => ({
    isAuthRequired: true,
    requiredPermissions: [perm, ...perms],
  }),
  /**
   * Represents a use case that can only be executed by the system itself.
   * This is used for system-level operations that do not require user authentication.
   */
  System: () => ({
    isAuthRequired: true,
    requiredPermissions: ["SYSTEM"],
  }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as const satisfies Record<string, (...args: any) => UseCaseAuth>;
