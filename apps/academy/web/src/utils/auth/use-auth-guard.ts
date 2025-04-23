import type { UseCaseAuth } from "@ulthar/academy-domain";
import { useContext } from "react";
import { useLocation, useNavigate } from "react-router";
import { AuthContext } from "./auth-context.ts";

export function useAuthGuard({
  isAuthRequired,
  requiredPermissions,
}: UseCaseAuth) {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  if (!user && isAuthRequired) {
    console.warn("User is not authenticated. Redirecting to login page.");
    void navigate(`/login?redirect=${location.pathname}`, {
      replace: true,
    });
  }

  if (!user) {
    return;
  }

  if (!requiredPermissions.every((perm) => user.permissions.includes(perm))) {
    console.warn(
      "User does not have the required permissions, redirecting to home page.",
    );
    void navigate(`/home`, {
      replace: true,
    });
  }
}
