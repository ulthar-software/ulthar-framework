import type { UserAccess } from "@ulthar/academy-domain";
import { createContext } from "react";

interface AuthContextType {
  user?: UserAccess;
  accessToken?: string;
  setAccessToken: (token: string) => void;
  removeAccessToken: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: undefined,
  accessToken: undefined,
  setAccessToken: () => undefined,
  removeAccessToken: () => undefined,
});
