/** 本地登录账号（后续可改为 SSO 子系统接入） */

export type UnifyUser = {
  username: string;
  displayName: string;
  password: string;
};

const USERS: UnifyUser[] = [
  { username: "admin", displayName: "管理员", password: "admin123" },
  { username: "auditor", displayName: "审核员", password: "audit123" },
];

export function authenticate(
  username: string,
  password: string,
): { ok: true; user: Omit<UnifyUser, "password"> } | { ok: false; message: string } {
  const u = USERS.find((x) => x.username === username.trim());
  if (!u || u.password !== password) {
    return { ok: false, message: "用户名或密码错误" };
  }
  return { ok: true, user: { username: u.username, displayName: u.displayName } };
}

export function findUser(username: string) {
  const u = USERS.find((x) => x.username === username);
  if (!u) return null;
  return { username: u.username, displayName: u.displayName };
}
