import type { Permission } from "@ulthar/academy-domain";
import { useContext } from "react";
import { useLocation, useNavigate } from "react-router";
import { AuthContext } from "./auth-context.ts";

export interface AuthPolicy {
  permissions: Permission[];
  requiresAuth: boolean;
}

export interface AuthGuardConfig {
  auth: AuthPolicy;
  redirectTo: string;
}

export function useAuthGuard({ auth, redirectTo }: AuthGuardConfig) {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  if (!user && auth.requiresAuth) {
    void navigate(`${redirectTo}?redirect=${location.pathname}`, {
      replace: true,
    });
  }

  if (!user) {
    return;
  }

  const userPermissions = user.permissions;
  const permissions = auth.permissions;

  if (!permissions.every((perm) => userPermissions.includes(perm))) {
    void navigate(`${redirectTo}?redirect=${location.pathname}`, {
      replace: true,
    });
  }
}
