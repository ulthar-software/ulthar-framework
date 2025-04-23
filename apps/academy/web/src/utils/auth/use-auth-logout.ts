import { useContext } from "react";
import { AuthContext } from "./auth-context";

export function useAuthLogout() {
  const { removeAccessToken } = useContext(AuthContext);
  return removeAccessToken;
}
