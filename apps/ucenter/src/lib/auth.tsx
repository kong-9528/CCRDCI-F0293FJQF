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
  clearSession,
  getSession,
  sendSmsCode,
  setSession,
  type SessionUser,
  type UcenterAccount,
} from "@/lib/accountStore";

type AuthContextValue = {
  user: SessionUser | null;
  ready: boolean;
  login: (
    username: string,
    password: string,
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
  loginWithSms: (
    phone: string,
    code: string,
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
  sendLoginSms: (phone: string) => Promise<{ ok: true; message: string } | { ok: false; message: string }>;
  loginAfterRegister: (account: UcenterAccount) => void;
  logout: () => void;
  refresh: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    setUser(getSession());
  }, []);

  useEffect(() => {
    refresh();
    setReady(true);
  }, [refresh]);

  const login = useCallback(async (username: string, password: string) => {
    const result = authenticatePassword(username, password);
    if (!result.ok) return result;
    setSession(result.account);
    setUser({ username: result.account.username, phone: result.account.phone });
    return { ok: true as const };
  }, []);

  const sendLoginSms = useCallback(async (phone: string) => {
    return sendSmsCode(phone, "login");
  }, []);

  const loginWithSms = useCallback(async (phone: string, code: string) => {
    const result = authenticateSms(phone, code);
    if (!result.ok) return result;
    setSession(result.account);
    setUser({ username: result.account.username, phone: result.account.phone });
    return { ok: true as const };
  }, []);

  const loginAfterRegister = useCallback((account: UcenterAccount) => {
    setSession(account);
    setUser({ username: account.username, phone: account.phone });
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      login,
      loginWithSms,
      sendLoginSms,
      loginAfterRegister,
      logout,
      refresh,
    }),
    [user, ready, login, loginWithSms, sendLoginSms, loginAfterRegister, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
