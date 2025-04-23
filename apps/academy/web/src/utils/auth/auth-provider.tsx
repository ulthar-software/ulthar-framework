import { JSONExt } from "@fabric/core";
import { type UserAccess } from "@ulthar/academy-domain";
import type { PropsWithChildren } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./auth-context.ts";
import { decodeJWT } from "./decode-jwt.ts";

const LOCAL_STORAGE_TOKEN_KEY = "academy_access_token";
const LOCAL_STORAGE_USER_KEY = "academy_access_user";

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<UserAccess | undefined>(getStoredUser());
  const [accessToken, setAccessTokenState] = useState<string | undefined>(
    localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY) ?? undefined,
  );

  // Function to handle setting the access token
  const setAccessToken = useCallback((token: string) => {
    localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, token);
    setAccessTokenState(token);
  }, []);

  // Function to handle removing the access token (logout)
  const removeAccessToken = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
    setAccessTokenState(undefined);
    setUser(undefined);
  }, []);

  // Decode the JWT token to get user information
  useEffect(() => {
    if (!accessToken) {
      setUser(undefined);
      return;
    }

    // For JWT tokens, they are in format: header.payload.signature
    // We need the payload part which is base64 encoded
    const result = decodeJWT<UserAccess>(accessToken);

    if (result.isError()) {
      // If the token is invalid, remove it and set user to undefined
      removeAccessToken();
      return;
    }

    const payload = result.unwrapOrThrow();

    // Set the user with the decoded information
    setUser({
      id: payload.id,
      permissions: payload.permissions,
    });

    localStorage.setItem(
      LOCAL_STORAGE_USER_KEY,
      JSONExt.stringify(payload).unwrapOrThrow(),
    );
  }, [accessToken, removeAccessToken]);

  // Create the context value with our auth state and methods
  const contextValue = useMemo(
    () => ({
      user,
      token: accessToken,
      setAccessToken,
      removeAccessToken,
    }),
    [user, accessToken, setAccessToken, removeAccessToken],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

function getStoredUser(): UserAccess | undefined {
  const storedString = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
  if (!storedString) {
    return undefined;
  }
  try {
    return JSONExt.parse<UserAccess>(storedString).unwrapOrThrow();
  } catch {
    return undefined;
  }
}
