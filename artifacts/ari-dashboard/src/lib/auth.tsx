import { createContext, useContext, type ReactNode } from "react";
import { useAuth as useReplitAuth } from "@workspace/replit-auth-web";

export interface AuthUser {
  id: string;
  name: string;
  role: string;
  email: string | null;
  avatarUrl?: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: rawUser, isLoading, login, logout } = useReplitAuth();

  const user: AuthUser | null = rawUser
    ? {
        id: rawUser.id,
        name:
          [rawUser.firstName, rawUser.lastName].filter(Boolean).join(" ") ||
          rawUser.email ||
          "Coach",
        role: "Coach",
        email: rawUser.email ?? null,
        avatarUrl: rawUser.profileImageUrl ?? null,
      }
    : null;

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
