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
const DEMO_SMS_CODE = "123456";

export type PortalUser = {
  username: string;
  displayName: string;
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
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/** 前端模拟登录：任意非空账号 + 密码 demo123；或手机号 + 短信验证码 123456 */
const MOCK_PASSWORD = "demo123";

let loginSmsCode: string | null = null;
let loginSmsPhone: string | null = null;
let loginSmsExpiresAt = 0;

function normalizePhone(phone: string) {
  return phone.replace(/[\s-]/g, "");
}

function isValidMobile(phone: string) {
  return /^1\d{10}$/.test(normalizePhone(phone));
}

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

  const persistUser = (next: PortalUser) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setUser(next);
  };

  const login = useCallback(async (username: string, password: string) => {
    await new Promise((r) => setTimeout(r, 400));
    if (!username.trim() || !password) {
      return { ok: false as const, message: "请输入用户名和密码" };
    }
    if (password !== MOCK_PASSWORD) {
      return { ok: false as const, message: "用户名或密码错误" };
    }
    persistUser({
      username: username.trim(),
      displayName: username.trim(),
    });
    return { ok: true as const };
  }, []);

  const sendLoginSmsCode = useCallback(async (phone: string) => {
    await new Promise((r) => setTimeout(r, 280));
    if (!isValidMobile(phone)) {
      return { ok: false as const, message: "请输入正确的手机号" };
    }
    loginSmsPhone = normalizePhone(phone);
    loginSmsCode = DEMO_SMS_CODE;
    loginSmsExpiresAt = Date.now() + 10 * 60_000;
    return { ok: true as const, demoCode: DEMO_SMS_CODE };
  }, []);

  const loginWithSms = useCallback(async (phone: string, code: string) => {
    await new Promise((r) => setTimeout(r, 400));
    if (!isValidMobile(phone)) {
      return { ok: false as const, message: "请输入正确的手机号" };
    }
    if (!code.trim()) {
      return { ok: false as const, message: "请输入短信验证码" };
    }
    if (
      !loginSmsCode ||
      !loginSmsPhone ||
      Date.now() > loginSmsExpiresAt ||
      normalizePhone(phone) !== loginSmsPhone
    ) {
      return { ok: false as const, message: "请先获取短信验证码" };
    }
    if (code.trim() !== loginSmsCode) {
      return { ok: false as const, message: "验证码不正确" };
    }
    const digits = normalizePhone(phone);
    persistUser({
      username: digits,
      displayName: `${digits.slice(0, 3)}****${digits.slice(-4)}`,
    });
    loginSmsCode = null;
    loginSmsPhone = null;
    return { ok: true as const };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, ready, login, loginWithSms, sendLoginSmsCode, logout }),
    [user, ready, login, loginWithSms, sendLoginSmsCode, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
