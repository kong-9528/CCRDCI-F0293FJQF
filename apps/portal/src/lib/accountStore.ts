/**
 * 门户账号体系（前端演示）：
 * - 用户名全局唯一
 * - 手机号必填且全局唯一
 * - 手机号可在短信验证后换绑
 */

const ACCOUNTS_KEY = "ctp.portal.accounts";
const DEMO_SMS_CODE = "123456";

export type PortalAccount = {
  username: string;
  phone: string;
  password: string;
  createdAt: string;
};

type SmsChallenge = {
  phone: string;
  code: string;
  expiresAt: number;
  purpose: "register" | "login" | "rebind";
};

let smsChallenge: SmsChallenge | null = null;

function nowStamp() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

export function normalizePhone(phone: string) {
  return phone.replace(/[\s-]/g, "");
}

export function isValidMobile(phone: string) {
  return /^1\d{10}$/.test(normalizePhone(phone));
}

export function isValidUsername(username: string) {
  const u = username.trim();
  return /^[a-zA-Z][a-zA-Z0-9_]{3,19}$/.test(u);
}

/** 注册密码：8–12 位 */
export function isValidRegisterPassword(pwd: string) {
  return pwd.length >= 8 && pwd.length <= 12;
}

function readAccounts(): PortalAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return seedAccounts();
    const list = JSON.parse(raw) as PortalAccount[];
    return Array.isArray(list) && list.length > 0 ? list : seedAccounts();
  } catch {
    return seedAccounts();
  }
}

function writeAccounts(list: PortalAccount[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list));
}

function seedAccounts(): PortalAccount[] {
  const seed: PortalAccount[] = [
    {
      username: "demo",
      phone: "13800001234",
      password: "demo123456",
      createdAt: "2026-01-01 10:00:00",
    },
  ];
  try {
    writeAccounts(seed);
  } catch {
    /* ignore */
  }
  return seed;
}

export function listAccounts(): PortalAccount[] {
  if (typeof window === "undefined") return [];
  return readAccounts();
}

export function findByUsername(username: string) {
  const key = username.trim().toLowerCase();
  return listAccounts().find((a) => a.username.toLowerCase() === key) ?? null;
}

export function findByPhone(phone: string) {
  const key = normalizePhone(phone);
  return listAccounts().find((a) => a.phone === key) ?? null;
}

export function isUsernameTaken(username: string) {
  return Boolean(findByUsername(username));
}

export function isPhoneTaken(phone: string, exceptUsername?: string) {
  const hit = findByPhone(phone);
  if (!hit) return false;
  if (exceptUsername && hit.username.toLowerCase() === exceptUsername.trim().toLowerCase()) {
    return false;
  }
  return true;
}

export function sendSmsCode(
  phone: string,
  purpose: SmsChallenge["purpose"],
): { ok: true; demoCode: string } | { ok: false; message: string } {
  if (!isValidMobile(phone)) {
    return { ok: false, message: "请输入正确的手机号" };
  }
  const digits = normalizePhone(phone);
  if (purpose === "register" && isPhoneTaken(digits)) {
    return { ok: false, message: "该手机号已被注册" };
  }
  if (purpose === "login" && !findByPhone(digits)) {
    return { ok: false, message: "该手机号尚未注册" };
  }
  smsChallenge = {
    phone: digits,
    code: DEMO_SMS_CODE,
    expiresAt: Date.now() + 10 * 60_000,
    purpose,
  };
  return { ok: true, demoCode: DEMO_SMS_CODE };
}

export function verifySmsCode(
  phone: string,
  code: string,
  purpose: SmsChallenge["purpose"],
): { ok: true } | { ok: false; message: string } {
  if (!code.trim()) return { ok: false, message: "请输入短信验证码" };
  if (
    !smsChallenge ||
    smsChallenge.purpose !== purpose ||
    smsChallenge.phone !== normalizePhone(phone) ||
    Date.now() > smsChallenge.expiresAt
  ) {
    return { ok: false, message: "请先获取短信验证码" };
  }
  if (code.trim() !== smsChallenge.code) {
    return { ok: false, message: "验证码不正确" };
  }
  return { ok: true };
}

export function consumeSmsChallenge() {
  smsChallenge = null;
}

export function registerAccount(input: {
  username: string;
  password: string;
  phone: string;
}): { ok: true; account: PortalAccount } | { ok: false; message: string } {
  const username = input.username.trim();
  const phone = normalizePhone(input.phone);
  if (!isValidUsername(username)) {
    return {
      ok: false,
      message: "账号名须字母开头，仅含字母/数字/下划线，长度 4–20",
    };
  }
  if (!isValidRegisterPassword(input.password)) {
    return { ok: false, message: "密码须为 8–12 位" };
  }
  if (!isValidMobile(phone)) {
    return { ok: false, message: "请输入正确的手机号" };
  }
  if (isUsernameTaken(username)) {
    return { ok: false, message: "账号名已被占用" };
  }
  if (isPhoneTaken(phone)) {
    return { ok: false, message: "该手机号已被注册" };
  }

  const account: PortalAccount = {
    username,
    phone,
    password: input.password,
    createdAt: nowStamp(),
  };
  const list = listAccounts();
  writeAccounts([account, ...list]);
  consumeSmsChallenge();
  return { ok: true, account };
}

export function authenticatePassword(
  username: string,
  password: string,
): { ok: true; account: PortalAccount } | { ok: false; message: string } {
  if (!username.trim() || !password) {
    return { ok: false, message: "请输入用户名和密码" };
  }
  const account = findByUsername(username);
  if (!account || account.password !== password) {
    return { ok: false, message: "用户名或密码错误" };
  }
  return { ok: true, account };
}

export function authenticateSms(
  phone: string,
  code: string,
): { ok: true; account: PortalAccount } | { ok: false; message: string } {
  const check = verifySmsCode(phone, code, "login");
  if (!check.ok) return check;
  const account = findByPhone(phone);
  if (!account) {
    return { ok: false, message: "该手机号尚未注册" };
  }
  consumeSmsChallenge();
  return { ok: true, account };
}

/** 换绑手机号：短信验证新号后写入 */
export function rebindPhone(
  username: string,
  newPhone: string,
  code: string,
): { ok: true; account: PortalAccount } | { ok: false; message: string } {
  const check = verifySmsCode(newPhone, code, "rebind");
  if (!check.ok) return check;
  const phone = normalizePhone(newPhone);
  if (isPhoneTaken(phone, username)) {
    return { ok: false, message: "该手机号已被其他账号绑定" };
  }
  const list = listAccounts();
  const idx = list.findIndex((a) => a.username.toLowerCase() === username.trim().toLowerCase());
  if (idx < 0) return { ok: false, message: "账号不存在" };
  const next = { ...list[idx], phone };
  const copy = [...list];
  copy[idx] = next;
  writeAccounts(copy);
  consumeSmsChallenge();
  return { ok: true, account: next };
}

export function maskPhone(phone: string) {
  const digits = normalizePhone(phone);
  if (digits.length < 7) return phone;
  return `${digits.slice(0, 3)}****${digits.slice(-4)}`;
}
