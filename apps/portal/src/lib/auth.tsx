"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "ctp.portal.auth";

export type PortalUser = {
  username: string;
  displayName: string;
};

type AuthContextValue = {
  user: PortalUser | null;
  ready: boolean;
  login: (username: string, password: string) => Promise<{ ok: true } | { ok: false; message: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/** 前端模拟登录：任意非空账号 + 密码 demo123 可通过；后续接真实 API */
const MOCK_PASSWORD = "demo123";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PortalUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as PortalUser);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    await new Promise((r) => setTimeout(r, 400));
    if (!username.trim() || !password) {
      return { ok: false as const, message: "请输入用户名和密码" };
    }
    if (password !== MOCK_PASSWORD) {
      return { ok: false as const, message: "用户名或密码错误" };
    }
    const next: PortalUser = {
      username: username.trim(),
      displayName: username.trim(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setUser(next);
    return { ok: true as const };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, ready, login, logout }),
    [user, ready, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
