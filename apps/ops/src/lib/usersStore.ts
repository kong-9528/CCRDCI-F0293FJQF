import { useEffect, useState } from "react";
import {
  getAssignableRoles,
  getRoleById,
  syncRoleUserCounts,
  type Role,
} from "@/lib/rolesStore";

export type UserStatus = "enabled" | "disabled";

export type SysUser = {
  id: string;
  loginName: string;
  displayName: string;
  roleId: string;
  status: UserStatus;
  /** 内置超级管理员账号 */
  builtin?: boolean;
};

export const USER_STATUS_LABEL: Record<UserStatus, string> = {
  enabled: "启用",
  disabled: "停用",
};

/** 演示：当前登录的运营后台用户 */
export const CURRENT_USER_ID = "u-admin";

let userSeq = 20;
let users: SysUser[] = [
  {
    id: "u-admin",
    loginName: "admin",
    displayName: "超级管理员",
    roleId: "role-super",
    status: "enabled",
    builtin: true,
  },
  {
    id: "u-wang",
    loginName: "wang_editor",
    displayName: "王编辑",
    roleId: "role-ops",
    status: "enabled",
  },
  {
    id: "u-li",
    loginName: "li_ops",
    displayName: "李运营",
    roleId: "role-ops",
    status: "enabled",
  },
  {
    id: "u-viewer",
    loginName: "viewer01",
    displayName: "观察员甲",
    roleId: "role-viewer",
    status: "disabled",
  },
];

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
  recountRoles();
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function recountRoles() {
  const counts: Record<string, number> = {};
  for (const u of users) {
    counts[u.roleId] = (counts[u.roleId] ?? 0) + 1;
  }
  syncRoleUserCounts(counts);
}

// 初始化同步一次用户数
recountRoles();

export function getUsers(): SysUser[] {
  return users;
}

export function getCurrentUser(): SysUser | undefined {
  return users.find((u) => u.id === CURRENT_USER_ID);
}

export function getCurrentUserPermissions(): string[] {
  const me = getCurrentUser();
  if (!me) return [];
  return getRoleById(me.roleId)?.permissionIds ?? [];
}

export function roleNameOf(roleId: string) {
  return getRoleById(roleId)?.name ?? "—";
}

export function assignableRolesForCurrentUser(includeRoleId?: string): Role[] {
  const list = getAssignableRoles(getCurrentUserPermissions());
  if (includeRoleId && !list.some((r) => r.id === includeRoleId)) {
    const extra = getRoleById(includeRoleId);
    if (extra) return [...list, extra];
  }
  return list;
}

function loginNameExists(loginName: string, excludeId?: string) {
  const key = loginName.trim().toLowerCase();
  return users.some(
    (u) => u.id !== excludeId && u.loginName.toLowerCase() === key,
  );
}

export function createUser(input: {
  loginName: string;
  displayName: string;
  roleId: string;
}): string | null {
  const loginName = input.loginName.trim();
  const displayName = input.displayName.trim();
  if (!loginName) return "请填写登录名";
  if (!displayName) return "请填写用户名称";
  if (!input.roleId) return "请选择角色";
  if (loginNameExists(loginName)) return "登录名已存在，请更换后重试";

  const assignable = getAssignableRoles(getCurrentUserPermissions());
  if (!assignable.some((r) => r.id === input.roleId)) {
    return "不能分配超出当前账号权限范围的角色";
  }

  userSeq += 1;
  users = [
    {
      id: `u-${userSeq}`,
      loginName,
      displayName,
      roleId: input.roleId,
      status: "enabled",
    },
    ...users,
  ];
  emit();
  return null;
}

export function updateUser(
  id: string,
  input: { loginName: string; displayName: string; roleId: string },
): string | null {
  const user = users.find((u) => u.id === id);
  if (!user) return "用户不存在";
  if (user.builtin) return "超级管理员不可修改";

  const loginName = input.loginName.trim();
  const displayName = input.displayName.trim();
  if (!loginName) return "请填写登录名";
  if (!displayName) return "请填写用户名称";
  if (!input.roleId) return "请选择角色";
  if (loginNameExists(loginName, id)) return "登录名已存在，请更换后重试";

  const assignable = assignableRolesForCurrentUser(user.roleId);
  if (!assignable.some((r) => r.id === input.roleId)) {
    return "不能分配超出当前账号权限范围的角色";
  }

  users = users.map((u) =>
    u.id === id
      ? {
          ...u,
          loginName,
          displayName,
          roleId: input.roleId,
        }
      : u,
  );
  emit();
  return null;
}

export function setUserStatus(id: string, status: UserStatus): string | null {
  const user = users.find((u) => u.id === id);
  if (!user) return "用户不存在";
  if (user.builtin) return "超级管理员不可停用";
  if (user.id === CURRENT_USER_ID) return "不能停用当前登录账号";
  users = users.map((u) => (u.id === id ? { ...u, status } : u));
  emit();
  return null;
}

export function deleteUser(id: string): string | null {
  const user = users.find((u) => u.id === id);
  if (!user) return "用户不存在";
  if (user.builtin) return "超级管理员不可删除";
  if (user.id === CURRENT_USER_ID) return "不能删除当前登录账号";
  users = users.filter((u) => u.id !== id);
  emit();
  return null;
}

export function useUsersStore() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const onChange = () => setTick((n) => n + 1);
    return subscribe(onChange);
  }, []);
  return {
    users: getUsers(),
    currentUserId: CURRENT_USER_ID,
    roleNameOf,
    assignableRoles: assignableRolesForCurrentUser,
    createUser,
    updateUser,
    setUserStatus,
    deleteUser,
  };
}
