import type { Permission } from "@ulthar/academy-domain";
import { useContext } from "react";
import { AuthContext } from "./auth-context.ts";

export function useAuthHasPerm(...perms: Permission[]) {
  const { user } = useContext(AuthContext);

  if (!user) {
    return false;
  }

  return perms.every((perm) => user.permissions.includes(perm));
}
