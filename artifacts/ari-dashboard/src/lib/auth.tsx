import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface AuthUser {
  name: string;
  role: string;
  email: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const DEMO_COACHES: Record<string, AuthUser & { password: string }> = {
  "coach@ari.ai": { email: "coach@ari.ai", name: "Coach Carter", role: "Head Coach", password: "coach123" },
  "mancini@ari.ai": { email: "mancini@ari.ai", name: "Coach Mancini", role: "Fitness Coach", password: "coach123" },
  "garcia@ari.ai": { email: "garcia@ari.ai", name: "Coach García", role: "Analytics Coach", password: "coach123" },
};

const STORAGE_KEY = "ari_auth_user";

function loadUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  login: async () => false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadUser);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 900)); // simulate network
    const coach = DEMO_COACHES[email.toLowerCase()];
    if (coach && coach.password === password) {
      const authUser: AuthUser = { name: coach.name, role: coach.role, email: coach.email };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
      setUser(authUser);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
