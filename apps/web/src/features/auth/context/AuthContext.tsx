import { useMemo, useState, type PropsWithChildren } from "react";
import type { AuthenticatedUser } from "../types/auth";
import { AuthContext, type AuthContextValue } from "./authContextValue";

export function AuthProvider({ children }: PropsWithChildren) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken,
      user,
      authenticate: (token, authenticatedUser) => {
        setAccessToken(token);
        setUser(authenticatedUser);
      },
      logout: () => {
        setAccessToken(null);
        setUser(null);
      },
    }),
    [accessToken, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
