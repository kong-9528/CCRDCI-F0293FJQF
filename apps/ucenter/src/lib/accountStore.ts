/**
 * 统一用户中心账号（前端演示）：
 * - 用户名、手机号全局唯一
 * - 注册需短信验证码验明正身
 * - 短信验证码固定为 123456
 */

const ACCOUNTS_KEY = "ctp.ucenter.accounts";
const SESSION_KEY = "ctp.ucenter.session";
export const DEMO_SMS_CODE = "123456";

export type UcenterAccount = {
  username: string;
  phone: string;
  password: string;
  createdAt: string;
};

export type SmsPurpose = "register" | "login" | "forgot" | "rebind";

type SmsChallenge = {
  phone: string;
  code: string;
  expiresAt: number;
  purpose: SmsPurpose;
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
  return /^[a-zA-Z][a-zA-Z0-9_]{3,19}$/.test(username.trim());
}

/** 注册/重置密码：8–12 位 */
export function isValidPassword(pwd: string) {
  return pwd.length >= 8 && pwd.length <= 12;
}

function seedAccounts(): UcenterAccount[] {
  const seed: UcenterAccount[] = [
    {
      username: "demo",
      phone: "13800001234",
      password: "demo123456",
      createdAt: "2026-01-01 10:00:00",
    },
  ];
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(seed));
  } catch {
    /* ignore */
  }
  return seed;
}

function readAccounts(): UcenterAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return seedAccounts();
    const list = JSON.parse(raw) as UcenterAccount[];
    return Array.isArray(list) && list.length > 0 ? list : seedAccounts();
  } catch {
    return seedAccounts();
  }
}

function writeAccounts(list: UcenterAccount[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list));
}

export function findByUsername(username: string) {
  const key = username.trim().toLowerCase();
  return readAccounts().find((a) => a.username.toLowerCase() === key) ?? null;
}

export function findByPhone(phone: string) {
  const key = normalizePhone(phone);
  return readAccounts().find((a) => a.phone === key) ?? null;
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
  purpose: SmsPurpose,
): { ok: true; message: string } | { ok: false; message: string } {
  const digits = normalizePhone(phone);
  if (!isValidMobile(digits)) {
    return { ok: false, message: "请输入正确的手机号" };
  }
  if (purpose === "register" && isPhoneTaken(digits)) {
    return { ok: false, message: "该手机号已注册" };
  }
  if ((purpose === "login" || purpose === "forgot") && !findByPhone(digits)) {
    return { ok: false, message: "该手机号未注册" };
  }
  if (purpose === "rebind" && isPhoneTaken(digits)) {
    return { ok: false, message: "该手机号已被其他账号绑定" };
  }

  smsChallenge = {
    phone: digits,
    code: DEMO_SMS_CODE,
    expiresAt: Date.now() + 5 * 60 * 1000,
    purpose,
  };
  return { ok: true, message: `验证码已发送（演示码 ${DEMO_SMS_CODE}）` };
}

export function verifySmsCode(
  phone: string,
  code: string,
  purpose: SmsPurpose,
): { ok: true } | { ok: false; message: string } {
  const digits = normalizePhone(phone);
  if (!smsChallenge || smsChallenge.phone !== digits || smsChallenge.purpose !== purpose) {
    return { ok: false, message: "请先获取短信验证码" };
  }
  if (Date.now() > smsChallenge.expiresAt) {
    smsChallenge = null;
    return { ok: false, message: "验证码已过期，请重新获取" };
  }
  if (code.trim() !== smsChallenge.code) {
    return { ok: false, message: "验证码错误" };
  }
  smsChallenge = null;
  return { ok: true };
}

export function registerAccount(input: {
  username: string;
  password: string;
  phone: string;
}): { ok: true; account: UcenterAccount } | { ok: false; message: string } {
  const username = input.username.trim();
  const phone = normalizePhone(input.phone);

  if (!isValidUsername(username)) {
    return { ok: false, message: "用户名须为 4–20 位，字母开头，仅含字母数字下划线" };
  }
  if (!isValidPassword(input.password)) {
    return { ok: false, message: "密码须为 8–12 位" };
  }
  if (!isValidMobile(phone)) {
    return { ok: false, message: "请输入正确的手机号" };
  }
  if (isUsernameTaken(username)) {
    return { ok: false, message: "用户名已被占用" };
  }
  if (isPhoneTaken(phone)) {
    return { ok: false, message: "该手机号已注册" };
  }

  const account: UcenterAccount = {
    username,
    phone,
    password: input.password,
    createdAt: nowStamp(),
  };
  const list = readAccounts();
  list.push(account);
  writeAccounts(list);
  return { ok: true, account };
}

export function authenticatePassword(
  username: string,
  password: string,
): { ok: true; account: UcenterAccount } | { ok: false; message: string } {
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
): { ok: true; account: UcenterAccount } | { ok: false; message: string } {
  const check = verifySmsCode(phone, code, "login");
  if (!check.ok) return check;
  const account = findByPhone(phone);
  if (!account) return { ok: false, message: "该手机号未注册" };
  return { ok: true, account };
}

export function resetPasswordByPhone(
  phone: string,
  newPassword: string,
): { ok: true } | { ok: false; message: string } {
  if (!isValidPassword(newPassword)) {
    return { ok: false, message: "密码须为 8–12 位" };
  }
  const digits = normalizePhone(phone);
  const list = readAccounts();
  const idx = list.findIndex((a) => a.phone === digits);
  if (idx < 0) return { ok: false, message: "该手机号未注册" };
  list[idx] = { ...list[idx], password: newPassword };
  writeAccounts(list);
  return { ok: true };
}

export function changePassword(
  username: string,
  oldPassword: string,
  newPassword: string,
): { ok: true } | { ok: false; message: string } {
  const account = findByUsername(username);
  if (!account || account.password !== oldPassword) {
    return { ok: false, message: "原密码不正确" };
  }
  if (!isValidPassword(newPassword)) {
    return { ok: false, message: "新密码须为 8–12 位" };
  }
  if (oldPassword === newPassword) {
    return { ok: false, message: "新密码不能与原密码相同" };
  }
  const list = readAccounts();
  const idx = list.findIndex((a) => a.username.toLowerCase() === username.trim().toLowerCase());
  if (idx < 0) return { ok: false, message: "账号不存在" };
  list[idx] = { ...list[idx], password: newPassword };
  writeAccounts(list);
  return { ok: true };
}

export function rebindPhone(
  username: string,
  newPhone: string,
): { ok: true; account: UcenterAccount } | { ok: false; message: string } {
  const digits = normalizePhone(newPhone);
  if (!isValidMobile(digits)) {
    return { ok: false, message: "请输入正确的手机号" };
  }
  if (isPhoneTaken(digits, username)) {
    return { ok: false, message: "该手机号已被其他账号绑定" };
  }
  const list = readAccounts();
  const idx = list.findIndex((a) => a.username.toLowerCase() === username.trim().toLowerCase());
  if (idx < 0) return { ok: false, message: "账号不存在" };
  list[idx] = { ...list[idx], phone: digits };
  writeAccounts(list);
  try {
    const session = getSession();
    if (session && session.username.toLowerCase() === username.trim().toLowerCase()) {
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ username: list[idx].username, phone: list[idx].phone }),
      );
    }
  } catch {
    /* ignore */
  }
  return { ok: true, account: list[idx] };
}

export type SessionUser = {
  username: string;
  phone: string;
};

export function getSession(): SessionUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function setSession(account: UcenterAccount) {
  const session: SessionUser = { username: account.username, phone: account.phone };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
