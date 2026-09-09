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
  SSO_BOOT_MS,
  clearSession,
  createDemoSession,
  resolveSessionOffline,
  type OpsSession,
} from "@/lib/ssoSession";

type AuthValue = {
  session: OpsSession | null;
  ready: boolean;
  booting: boolean;
  logout: () => void;
  reenter: () => void;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<OpsSession | null>(null);
  const [ready, setReady] = useState(false);
  const [booting, setBooting] = useState(true);
  const [bootToken, setBootToken] = useState(0);

  useEffect(() => {
    setBooting(true);
    setReady(false);
    setSession(null);
    const timer = window.setTimeout(() => {
      const next = resolveSessionOffline();
      setSession(next);
      setBooting(false);
      setReady(true);
    }, SSO_BOOT_MS);
    return () => window.clearTimeout(timer);
  }, [bootToken]);

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
    setReady(false);
    setBooting(false);
  }, []);

  const reenter = useCallback(() => {
    clearSession();
    createDemoSession();
    setBootToken((n) => n + 1);
  }, []);

  const value = useMemo(
    () => ({ session, ready, booting, logout, reenter }),
    [session, ready, booting, logout, reenter],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside AuthProvider");
  return ctx;
}
