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
  resolveSessionFromSso,
  type OpsSession,
} from "@/lib/ssoSession";
import { SSO_URL } from "@/lib/publicEnv";

type AuthValue = {
  session: OpsSession | null;
  ready: boolean;
  booting: boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthValue | null>(null);

export function redirectToSso() {
  const returnUrl = window.location.origin + "/";
  window.location.replace(
    `${SSO_URL}/login?return_url=${encodeURIComponent(returnUrl)}`,
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<OpsSession | null>(null);
  const [ready, setReady] = useState(false);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    setBooting(true);
    setReady(false);
    const timer = window.setTimeout(() => {
      const next = resolveSessionFromSso();
      setSession(next);
      setBooting(false);
      setReady(true);
      if (!next) redirectToSso();
    }, SSO_BOOT_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
    setReady(false);
    setBooting(false);
    redirectToSso();
  }, []);

  const value = useMemo(
    () => ({ session, ready, booting, logout }),
    [session, ready, booting, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside AuthProvider");
  return ctx;
}
