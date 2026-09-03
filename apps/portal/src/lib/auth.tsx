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
import {
  authenticatePassword,
  authenticateSms,
  findByUsername,
  maskPhone,
  sendSmsCode,
  type PortalAccount,
} from "@/lib/accountStore";

const STORAGE_KEY = "ctp.portal.auth";

export type PortalUser = {
  username: string;
  displayName: string;
  phone?: string;
};

type AuthContextValue = {
  user: PortalUser | null;
  ready: boolean;
  login: (
    username: string,
    password: string,
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
  loginWithSms: (
    phone: string,
    code: string,
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
  sendLoginSmsCode: (
    phone: string,
  ) => Promise<{ ok: true; demoCode?: string } | { ok: false; message: string }>;
  loginAfterRegister: (account: PortalAccount) => void;
  refreshUserPhone: (phone: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function toUser(account: PortalAccount): PortalUser {
  return {
    username: account.username,
    displayName: account.username,
    phone: account.phone,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PortalUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PortalUser;
        const latest = findByUsername(parsed.username);
        if (latest) {
          const next = toUser(latest);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          setUser(next);
        } else {
          setUser(parsed);
        }
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const persistUser = (next: PortalUser) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setUser(next);
  };

  const login = useCallback(async (username: string, password: string) => {
    await new Promise((r) => setTimeout(r, 400));
    const result = authenticatePassword(username, password);
    if (!result.ok) return result;
    persistUser(toUser(result.account));
    return { ok: true as const };
  }, []);

  const sendLoginSmsCode = useCallback(async (phone: string) => {
    await new Promise((r) => setTimeout(r, 280));
    const result = sendSmsCode(phone, "login");
    if (!result.ok) return { ok: false as const, message: result.message };
    return { ok: true as const, demoCode: result.demoCode };
  }, []);

  const loginWithSms = useCallback(async (phone: string, code: string) => {
    await new Promise((r) => setTimeout(r, 400));
    const result = authenticateSms(phone, code);
    if (!result.ok) return result;
    persistUser(toUser(result.account));
    return { ok: true as const };
  }, []);

  const loginAfterRegister = useCallback((account: PortalAccount) => {
    persistUser(toUser(account));
  }, []);

  const refreshUserPhone = useCallback((phone: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, phone };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      login,
      loginWithSms,
      sendLoginSmsCode,
      loginAfterRegister,
      refreshUserPhone,
      logout,
    }),
    [
      user,
      ready,
      login,
      loginWithSms,
      sendLoginSmsCode,
      loginAfterRegister,
      refreshUserPhone,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { maskPhone };
