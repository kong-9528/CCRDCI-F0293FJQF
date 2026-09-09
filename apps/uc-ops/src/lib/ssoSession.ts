/** SSO 会话（演示）：不探测真实 SSO 服务是否在线 */
export const SESSION_KEY = "ctp.uc-ops.sso-session";

/** 入口动画时长（毫秒） */
export const SSO_BOOT_MS = 1200;

export type OpsSession = {
  username: string;
  displayName: string;
  ticket: string;
  loggedInAt: string;
  /** demo = 前端演示会话；sso = 来自 URL ticket */
  source: "demo" | "sso";
};

function stamp() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

export function getSession(): OpsSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OpsSession;
  } catch {
    return null;
  }
}

export function setSession(session: OpsSession) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

/** 演示用运营会话（不依赖 SSO 进程） */
export function createDemoSession(): OpsSession {
  const session: OpsSession = {
    ticket: `demo-${Date.now()}`,
    username: "admin",
    displayName: "超级管理员",
    loggedInAt: stamp(),
    source: "demo",
  };
  setSession(session);
  return session;
}

/** 从 URL 消费 SSO ticket（若有）；不访问 SSO 服务 */
export function consumeSsoTicketFromUrl(): OpsSession | null {
  const url = new URL(window.location.href);
  const ticket = url.searchParams.get("sso_ticket");
  if (!ticket) return null;
  const username = url.searchParams.get("username") || "operator";
  const displayName = url.searchParams.get("displayName") || username;
  const session: OpsSession = {
    ticket,
    username,
    displayName,
    loggedInAt: stamp(),
    source: "sso",
  };
  setSession(session);
  url.searchParams.delete("sso_ticket");
  url.searchParams.delete("username");
  url.searchParams.delete("displayName");
  window.history.replaceState({}, "", url.pathname + url.search + url.hash);
  return session;
}

/**
 * 解析当前会话：URL ticket → 已有 session → 演示会话。
 * 绝不发起对 SSO 的网络请求或页面跳转。
 */
export function resolveSessionOffline(): OpsSession {
  return consumeSsoTicketFromUrl() ?? getSession() ?? createDemoSession();
}
