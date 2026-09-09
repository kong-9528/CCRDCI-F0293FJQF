import type { SsoUser, Subsystem } from "@/lib/rbacStore";

/** 允许回跳的子系统 origin（演示防开放重定向） */
const ALLOWED_RETURN_ORIGINS = new Set([
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3005",
]);

export function isAllowedReturnUrl(url: string) {
  try {
    const u = new URL(url);
    return ALLOWED_RETURN_ORIGINS.has(u.origin);
  } catch {
    return false;
  }
}

/** 方案 A：子系统入口附带 SSO ticket，供目标系统建会话 */
export function buildSubsystemEntryUrl(sys: Subsystem, user: SsoUser | null | undefined) {
  if (!sys.entryUrl) return "#";
  if (!user) return sys.entryUrl;
  try {
    const u = new URL(sys.entryUrl);
    u.searchParams.set("sso_ticket", `sso-${user.id}-${Date.now()}`);
    u.searchParams.set("username", user.username);
    u.searchParams.set("displayName", user.displayName);
    return u.toString();
  } catch {
    return sys.entryUrl;
  }
}

/** 登录成功后若有合法 return_url，则带 ticket 回跳子系统 */
export function redirectWithSsoTicket(returnUrl: string, user: SsoUser) {
  if (!isAllowedReturnUrl(returnUrl)) return false;
  const u = new URL(returnUrl);
  u.searchParams.set("sso_ticket", `sso-${user.id}-${Date.now()}`);
  u.searchParams.set("username", user.username);
  u.searchParams.set("displayName", user.displayName);
  window.location.href = u.toString();
  return true;
}
