import type { MockedDependencies } from "../mocks.js";
import type { Permission } from "../security/permission.js";
import type { UserAccess } from "../services/auth-service.js";

export function mockUserAccess(
  { crypto }: MockedDependencies,
  permissions: Permission[],
): UserAccess {
  return {
    id: crypto.randomUUID(),
    permissions,
  };
}
