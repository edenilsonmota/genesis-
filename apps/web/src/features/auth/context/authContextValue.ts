import { createContext } from "react";
import type { AuthenticatedUser } from "../types/auth";

export type AuthContextValue = {
  accessToken: string | null;
  user: AuthenticatedUser | null;
  authenticate: (token: string, user: AuthenticatedUser) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
