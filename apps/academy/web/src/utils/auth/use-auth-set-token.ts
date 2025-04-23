import { useContext } from "react";
import { AuthContext } from "./auth-context";

export function useAuthSetToken() {
  const { setAccessToken } = useContext(AuthContext);
  return setAccessToken;
}
