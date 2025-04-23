import type { PropsWithChildren } from "react";
import { AuthContext } from "./auth-context.ts";

export function AuthProvider({ children }: PropsWithChildren) {
  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
}
