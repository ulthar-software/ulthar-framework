import { useContext } from "react";
import { AuthContext } from "./auth-context";

export function useAuth() {
  const { user } = useContext(AuthContext);
  return user;
}
