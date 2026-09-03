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
  authenticate,
  changePassword,
  findUserByUsername,
  getUserPermissionCodes,
  getUserSubsystems,
  subscribeRbac,
  userHasPermission,
  type SsoUser,
  type Subsystem,
} from "@/lib/rbacStore";

const STORAGE_KEY = "ctp.sso.auth";

type AuthContextValue = {
  user: SsoUser | null;
  ready: boolean;
  permissionCodes: Set<string>;
  subsystems: Subsystem[];
  can: (code: string) => boolean;
  login: (
    username: string,
    password: string,
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
  logout: () => void;
  changeOwnPassword: (
    oldPassword: string,
    newPassword: string,
  ) => { ok: true } | { ok: false; message: string };
  refresh: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SsoUser | null>(null);
  const [ready, setReady] = useState(false);
  const [, setTick] = useState(0);

  const hydrate = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setUser(null);
        return;
      }
      const parsed = JSON.parse(raw) as { username: string };
      const latest = findUserByUsername(parsed.username);
      if (latest && latest.status === "active") {
        setUser(latest);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ username: latest.username }));
      } else {
        localStorage.removeItem(STORAGE_KEY);
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    hydrate();
    setReady(true);
    return subscribeRbac(() => {
      hydrate();
      setTick((n) => n + 1);
    });
  }, [hydrate]);

  const permissionCodes = useMemo(
    () => (user ? getUserPermissionCodes(user) : new Set<string>()),
    [user],
  );

  const subsystems = useMemo(() => (user ? getUserSubsystems(user) : []), [user]);

  const login = useCallback(async (username: string, password: string) => {
    await new Promise((r) => setTimeout(r, 280));
    const result = authenticate(username, password);
    if (!result.ok) return result;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ username: result.user.username }));
    setUser(result.user);
    return { ok: true as const };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const changeOwnPassword = useCallback(
    (oldPassword: string, newPassword: string) => {
      if (!user) return { ok: false as const, message: "未登录" };
      return changePassword(user.id, oldPassword, newPassword);
    },
    [user],
  );

  const value = useMemo(
    () => ({
      user,
      ready,
      permissionCodes,
      subsystems,
      can: (code: string) => (user ? userHasPermission(user, code) : false),
      login,
      logout,
      changeOwnPassword,
      refresh: hydrate,
    }),
    [user, ready, permissionCodes, subsystems, login, logout, changeOwnPassword, hydrate],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
