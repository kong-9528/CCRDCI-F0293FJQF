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
import type { ServiceApplyStatus, ServiceKind } from "@/lib/serviceAccess";

export type DemoAccount = "yachang" | "mayi" | "mayi1" | "mayi2";

export type AuthUser = {
  username: string;
  phone: string;
  orgName?: string;
  registryStatus: ServiceApplyStatus;
  techStatus: ServiceApplyStatus;
};

export type MenuItem = {
  label: string;
  href: string;
  external?: boolean;
  badge?: string;
  current?: boolean;
};

const AUTH_STORAGE_KEY = "dci-portal-auth-user";

export const CUSTOMER_CONSOLE_URL =
  process.env.NEXT_PUBLIC_CUSTOMER_URL?.replace(/\/$/, "") || "http://localhost:3002";

export const DEMO_PASSWORD = "Ccpc@123456";
export const DEMO_SMS_CODE = "0000";

type StoredAuth = {
  username: string;
  phone?: string;
  registryStatus?: ServiceApplyStatus;
  techStatus?: ServiceApplyStatus;
};

const MOCK_USERS: Record<DemoAccount, AuthUser> = {
  yachang: {
    username: "yachang",
    phone: "13900001111",
    registryStatus: "none",
    techStatus: "none",
  },
  mayi: {
    username: "mayi",
    phone: "13800008000",
    orgName: "太极计算机股份有限公司",
    registryStatus: "approved",
    techStatus: "pending",
  },
  mayi1: {
    username: "mayi1",
    phone: "13800008001",
    orgName: "太极计算机股份有限公司",
    registryStatus: "rejected",
    techStatus: "approved",
  },
  mayi2: {
    username: "mayi2",
    phone: "13800008002",
    orgName: "太极计算机股份有限公司",
    registryStatus: "approved",
    techStatus: "approved",
  },
};

export function isDemoAccount(name: string): name is DemoAccount {
  return name in MOCK_USERS;
}

export function isValidDemoPassword(password: string) {
  return password === "" || password === DEMO_PASSWORD;
}

export function maskPhone(phone: string) {
  if (!phone || phone.length < 7) return phone || "-";
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
}

export function hasRegistryWorkbench(user: AuthUser) {
  return user.registryStatus === "approved";
}

export function hasTechWorkbench(user: AuthUser) {
  return user.techStatus === "approved";
}

export function getOpenedServicesLabel(user: AuthUser) {
  const registry = hasRegistryWorkbench(user);
  const tech = hasTechWorkbench(user);
  if (registry && tech) return "DCI注册中心、DCI®技术服务中心";
  if (registry) return "DCI注册中心";
  if (tech) return "DCI®技术服务中心";
  return "-";
}

export type PostLoginAction =
  | { type: "home" }
  | { type: "customer"; url: string };

export function getPostLoginAction(username: DemoAccount): PostLoginAction {
  if (username === "mayi1") {
    return { type: "customer", url: CUSTOMER_CONSOLE_URL };
  }
  return { type: "home" };
}

/** 仅当路径落在对应工作台内时标记「当前平台」；门户页不标记任何工作台 */
export function buildUserMenuItems(user: AuthUser, pathname = ""): MenuItem[] {
  const path = !pathname || pathname === "/" ? "/" : pathname.endsWith("/") ? pathname : `${pathname}/`;
  const onRegistryWorkbench = path === "/dashboard/" || path.startsWith("/dashboard/");

  const items: MenuItem[] = [{ label: "账号中心", href: "/account/info/" }];

  if (hasRegistryWorkbench(user)) {
    items.push({
      label: "DCI注册中心工作台",
      href: "/dashboard/",
      ...(onRegistryWorkbench ? { badge: "当前平台", current: true } : {}),
    });
  }

  if (hasTechWorkbench(user)) {
    // 技术服务工作台在 customer 应用；门户侧永远不标记为当前平台
    items.push({
      label: "技术服务中心工作台",
      href: CUSTOMER_CONSOLE_URL,
      external: true,
    });
  }

  return items;
}

type AuthContextValue = {
  user: AuthUser | null;
  ready: boolean;
  login: (username: string) => boolean;
  logout: () => void;
  updatePhone: (phone: string) => void;
  /** 按状态机更新开通申请状态 */
  updateServiceStatus: (kind: ServiceKind, status: ServiceApplyStatus) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function resolveUser(stored: StoredAuth): AuthUser | null {
  if (!stored?.username || !isDemoAccount(stored.username)) return null;
  const base = MOCK_USERS[stored.username];
  return {
    ...base,
    phone: stored.phone || base.phone,
    registryStatus: stored.registryStatus ?? base.registryStatus,
    techStatus: stored.techStatus ?? base.techStatus,
  };
}

function readStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return resolveUser(JSON.parse(raw) as StoredAuth);
  } catch {
    return null;
  }
}

function writeStored(user: AuthUser) {
  const payload: StoredAuth = {
    username: user.username,
    phone: user.phone,
    registryStatus: user.registryStatus,
    techStatus: user.techStatus,
  };
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(readStoredUser());
    setReady(true);
  }, []);

  const login = useCallback((username: string) => {
    const key = username.trim().toLowerCase();
    if (!isDemoAccount(key)) return false;
    const next = { ...MOCK_USERS[key] };
    writeStored(next);
    setUser(next);
    return true;
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
  }, []);

  const updatePhone = useCallback((phone: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, phone };
      writeStored(next);
      return next;
    });
  }, []);

  const updateServiceStatus = useCallback((kind: ServiceKind, status: ServiceApplyStatus) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next =
        kind === "registry"
          ? { ...prev, registryStatus: status }
          : { ...prev, techStatus: status };
      writeStored(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      login,
      logout,
      updatePhone,
      updateServiceStatus,
    }),
    [user, ready, login, logout, updatePhone, updateServiceStatus],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
