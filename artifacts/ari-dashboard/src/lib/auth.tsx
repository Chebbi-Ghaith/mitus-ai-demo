import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

export interface AuthUser {
  id: string;
  name: string;
  role: string;
  email: string;
  avatarUrl?: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (name: string, email: string, password: string, role: string) => Promise<{ ok: boolean; error?: string }>;
  loginWithGoogle: (credential: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  login: async () => ({ ok: false }),
  register: async () => ({ ok: false }),
  loginWithGoogle: async () => ({ ok: false }),
  logout: async () => {},
});

async function apiFetch(path: string, options?: RequestInit) {
  return fetch(path, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
    ...options,
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/auth/me")
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setUser(data); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    let data: any = {};
    try {
      data = await res.json();
    } catch {
      data = { error: "Failed to parse server response" };
    }
    if (res.ok) { setUser(data); return { ok: true }; }
    return { ok: false, error: data.error ?? "Login failed." };
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, role: string) => {
    const res = await apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role }),
    });
    let data: any = {};
    try {
      data = await res.json();
    } catch {
      data = { error: "Failed to parse server response" };
    }
    if (res.ok) { setUser(data); return { ok: true }; }
    return { ok: false, error: data.error ?? "Registration failed." };
  }, []);

  const loginWithGoogle = useCallback(async (credential: string) => {
    const res = await apiFetch("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential }),
    });
    let data: any = {};
    try {
      data = await res.json();
    } catch {
      data = { error: "Failed to parse server response" };
    }
    if (res.ok) { setUser(data); return { ok: true }; }
    return { ok: false, error: data.error ?? "Google login failed." };
  }, []);

  const logout = useCallback(async () => {
    await apiFetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
