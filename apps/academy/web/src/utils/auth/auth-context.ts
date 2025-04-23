import type { UserAccess } from "@ulthar/academy-domain";
import { createContext } from "react";

interface AuthContextType {
  user?: UserAccess;
}

export const AuthContext = createContext<AuthContextType>({
  user: undefined,
});
