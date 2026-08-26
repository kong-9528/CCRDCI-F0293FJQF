import { MOCK_TENANT } from "@/lib/tenant";

const SPECIAL = /[!_@#]/;
const SEND_INTERVAL_MS = 60_000;
const DAILY_SEND_LIMIT = 10;
const CODE_TTL_MS = 10 * 60_000;
const DEMO_CODE = "123456";

/** 演示用当前登录密码（修改成功后会更新） */
let currentPassword = "Demo@2026";

type SendLog = {
  dateKey: string;
  count: number;
  lastSentAt: number;
};

let sendLog: SendLog = { dateKey: "", count: 0, lastSentAt: 0 };
let flowOldVerified = false;
let flowEmailVerified = false;
let pendingCode: string | null = null;
let codeExpiresAt = 0;

type MockSession = {
  id: string;
  device: string;
  lastActive: string;
};

let sessions: MockSession[] = [
  { id: "sess-current", device: "当前浏览器", lastActive: "刚刚" },
  { id: "sess-win", device: "Chrome · Windows", lastActive: "2 小时前" },
  { id: "sess-ios", device: "Safari · iPhone", lastActive: "昨天 18:20" },
];

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function resetDailyIfNeeded() {
  const key = todayKey();
  if (sendLog.dateKey !== key) {
    sendLog = { dateKey: key, count: 0, lastSentAt: 0 };
  }
}

export function getBoundEmail() {
  return MOCK_TENANT.contactEmail;
}

export function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  if (local.length <= 1) return `*@${domain}`;
  return `${local[0]}***@${domain}`;
}

export function isStrongPassword(pwd: string): boolean {
  if (pwd.length < 8) return false;
  let kinds = 0;
  if (/[A-Z]/.test(pwd)) kinds += 1;
  if (/[a-z]/.test(pwd)) kinds += 1;
  if (/\d/.test(pwd)) kinds += 1;
  if (SPECIAL.test(pwd)) kinds += 1;
  return kinds >= 3;
}

export function resetPasswordChangeFlow() {
  flowOldVerified = false;
  flowEmailVerified = false;
  pendingCode = null;
  codeExpiresAt = 0;
}

export function getSendCodeCooldownSec(): number {
  resetDailyIfNeeded();
  if (!sendLog.lastSentAt) return 0;
  const remain = Math.ceil((sendLog.lastSentAt + SEND_INTERVAL_MS - Date.now()) / 1000);
  return Math.max(0, remain);
}

export function getDailySendRemaining(): number {
  resetDailyIfNeeded();
  return Math.max(0, DAILY_SEND_LIMIT - sendLog.count);
}

export function verifyOldPassword(password: string):
  | { ok: true }
  | { ok: false; error: string } {
  resetPasswordChangeFlow();
  if (!password.trim()) {
    return { ok: false, error: "请输入当前密码" };
  }
  if (password !== currentPassword) {
    return { ok: false, error: "当前密码不正确" };
  }
  flowOldVerified = true;
  return { ok: true };
}

export function sendEmailVerificationCode():
  | { ok: true; maskedEmail: string; cooldownSec: number; demoCode?: string }
  | { ok: false; error: string; cooldownSec?: number } {
  if (!flowOldVerified) {
    return { ok: false, error: "请先完成当前密码验证" };
  }

  resetDailyIfNeeded();
  const cooldownSec = getSendCodeCooldownSec();
  if (cooldownSec > 0) {
    return {
      ok: false,
      error: `发送过于频繁，请 ${cooldownSec} 秒后再试`,
      cooldownSec,
    };
  }
  if (sendLog.count >= DAILY_SEND_LIMIT) {
    return { ok: false, error: "今日验证码发送次数已达上限（10 次），请明日再试" };
  }

  pendingCode = DEMO_CODE;
  codeExpiresAt = Date.now() + CODE_TTL_MS;
  sendLog = {
    dateKey: todayKey(),
    count: sendLog.count + 1,
    lastSentAt: Date.now(),
  };

  return {
    ok: true,
    maskedEmail: maskEmail(getBoundEmail()),
    cooldownSec: 60,
    demoCode: DEMO_CODE,
  };
}

export function verifyEmailCode(code: string):
  | { ok: true }
  | { ok: false; error: string } {
  if (!flowOldVerified) {
    return { ok: false, error: "请先完成当前密码验证" };
  }
  if (!pendingCode || Date.now() > codeExpiresAt) {
    return { ok: false, error: "验证码已失效，请重新获取" };
  }
  if (!code.trim()) {
    return { ok: false, error: "请输入邮箱验证码" };
  }
  if (code.trim() !== pendingCode) {
    return { ok: false, error: "验证码不正确" };
  }
  flowEmailVerified = true;
  return { ok: true };
}

export function changePassword(newPassword: string, confirmPassword: string):
  | { ok: true; revokedSessions: number }
  | { ok: false; error: string } {
  if (!flowOldVerified || !flowEmailVerified) {
    return { ok: false, error: "请按步骤完成验证后再提交" };
  }
  if (!newPassword) {
    return { ok: false, error: "请输入新密码" };
  }
  if (!isStrongPassword(newPassword)) {
    return {
      ok: false,
      error: "新密码须至少 8 位，且大写/小写/数字/特殊符{!_@#}中至少满足 3 种",
    };
  }
  if (newPassword === currentPassword) {
    return { ok: false, error: "新密码不能与当前密码相同" };
  }
  if (newPassword !== confirmPassword) {
    return { ok: false, error: "两次输入的新密码不一致" };
  }

  currentPassword = newPassword;
  const revoked = sessions.filter((s) => s.id !== "sess-current").length;
  sessions = sessions.filter((s) => s.id === "sess-current");
  resetPasswordChangeFlow();
  return { ok: true, revokedSessions: revoked };
}

export function listActiveSessions() {
  return [...sessions];
}

/** 演示环境提示用 */
export function getDemoOldPasswordHint() {
  return "Demo@2026";
}
