import { useMemo } from "react";

/** DCI®技术服务中心（客户控制台）/ 运营后台 */
export type OpLogScope = "portal" | "ops";

export type OpLog = {
  id: string;
  scope: OpLogScope;
  /** 操作类型编码 */
  actionType: string;
  content: string;
  operator: string;
  /** YYYY-MM-DD HH:mm:ss */
  operatedAt: string;
};

export const OP_LOG_SCOPE_LABEL: Record<OpLogScope, string> = {
  portal: "DCI®技术服务中心",
  ops: "运营后台",
};

/** 各端操作类型（mock，后续可与真实埋点对齐） */
export const PORTAL_ACTION_TYPES: { value: string; label: string }[] = [
  { value: "login", label: "登录" },
  { value: "logout", label: "退出登录" },
  { value: "verify_single", label: "单次核验" },
  { value: "verify_batch", label: "批量核验" },
  { value: "audit_submit", label: "提交审核" },
  { value: "view_result", label: "查看结果" },
  { value: "change_password", label: "修改密码" },
];

export const OPS_ACTION_TYPES: { value: string; label: string }[] = [
  { value: "login", label: "登录" },
  { value: "customer_create", label: "新增客户" },
  { value: "customer_edit", label: "编辑客户" },
  { value: "customer_status", label: "启用/停用客户" },
  { value: "service_edit", label: "编辑产品服务" },
  { value: "product_shelf", label: "产品上架/下架" },
  { value: "content_publish", label: "内容显示/隐藏" },
  { value: "api_status", label: "接口上线/下线" },
];

export function actionTypesOf(scope: OpLogScope) {
  return scope === "portal" ? PORTAL_ACTION_TYPES : OPS_ACTION_TYPES;
}

export function actionTypeLabel(scope: OpLogScope, value: string) {
  return actionTypesOf(scope).find((t) => t.value === value)?.label ?? value;
}

const LOGS: OpLog[] = [
  {
    id: "p1",
    scope: "portal",
    actionType: "login",
    content: "账号 acme_admin 登录成功",
    operator: "acme_admin",
    operatedAt: "2026-08-20 09:12:03",
  },
  {
    id: "p2",
    scope: "portal",
    actionType: "verify_single",
    content: "提交 DCI 核验（软件），任务号 T20260820001",
    operator: "acme_admin",
    operatedAt: "2026-08-20 09:18:41",
  },
  {
    id: "p3",
    scope: "portal",
    actionType: "verify_batch",
    content: "批量核验上传 120 条，产品：版权信息核验",
    operator: "acme_ops",
    operatedAt: "2026-08-19 16:42:10",
  },
  {
    id: "p4",
    scope: "portal",
    actionType: "view_result",
    content: "查看核验结果详情，任务号 T20260819088",
    operator: "acme_ops",
    operatedAt: "2026-08-19 17:05:22",
  },
  {
    id: "p5",
    scope: "portal",
    actionType: "audit_submit",
    content: "提交内容安全审核，资源 ID R-88921",
    operator: "beta_user",
    operatedAt: "2026-08-18 11:20:08",
  },
  {
    id: "p6",
    scope: "portal",
    actionType: "change_password",
    content: "修改登录密码",
    operator: "beta_user",
    operatedAt: "2026-08-17 14:33:55",
  },
  {
    id: "p7",
    scope: "portal",
    actionType: "logout",
    content: "主动退出登录",
    operator: "acme_admin",
    operatedAt: "2026-08-20 12:01:00",
  },
  {
    id: "o1",
    scope: "ops",
    actionType: "login",
    content: "运营账号运营管理员登录成功",
    operator: "运营管理员",
    operatedAt: "2026-08-20 08:55:12",
  },
  {
    id: "o2",
    scope: "ops",
    actionType: "customer_create",
    content: "新增客户账号 acme_corp，公司：艾克米科技有限公司",
    operator: "运营管理员",
    operatedAt: "2026-08-20 10:05:40",
  },
  {
    id: "o3",
    scope: "ops",
    actionType: "customer_edit",
    content: "编辑客户 beta_media：更新联系人邮箱",
    operator: "王编辑",
    operatedAt: "2026-08-19 15:28:17",
  },
  {
    id: "o4",
    scope: "ops",
    actionType: "customer_status",
    content: "停用客户账号 gamma_test",
    operator: "运营管理员",
    operatedAt: "2026-08-19 18:02:44",
  },
  {
    id: "o5",
    scope: "ops",
    actionType: "service_edit",
    content: "调整客户 acme_corp 产品「DCI核验」额度：10000 → 20000",
    operator: "李运营",
    operatedAt: "2026-08-18 09:40:11",
  },
  {
    id: "o6",
    scope: "ops",
    actionType: "product_shelf",
    content: "产品「疑似侵权审核」下架",
    operator: "运营管理员",
    operatedAt: "2026-08-18 13:16:09",
  },
  {
    id: "o7",
    scope: "ops",
    actionType: "content_publish",
    content: "帮助文章「API Key 管理」设为显示",
    operator: "王编辑",
    operatedAt: "2026-08-17 16:50:33",
  },
  {
    id: "o8",
    scope: "ops",
    actionType: "api_status",
    content: "接口「版权证书核验 - 批量调用」下线",
    operator: "李运营",
    operatedAt: "2026-08-16 11:08:27",
  },
];

export function getOpLogs(): OpLog[] {
  return LOGS;
}

export function operatorsOf(scope: OpLogScope): string[] {
  const set = new Set<string>();
  for (const log of LOGS) {
    if (log.scope === scope) set.add(log.operator);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, "zh"));
}

export type OpLogFilters = {
  actionType: string;
  operator: string;
  from: string;
  to: string;
};

export function filterOpLogs(scope: OpLogScope, filters: OpLogFilters): OpLog[] {
  return LOGS.filter((log) => {
    if (log.scope !== scope) return false;
    if (filters.actionType && log.actionType !== filters.actionType) return false;
    if (filters.operator && log.operator !== filters.operator) return false;
    const day = log.operatedAt.slice(0, 10);
    if (filters.from && day < filters.from) return false;
    if (filters.to && day > filters.to) return false;
    return true;
  }).sort((a, b) => b.operatedAt.localeCompare(a.operatedAt));
}

export function useOpLogOptions(scope: OpLogScope) {
  return useMemo(
    () => ({
      actionTypes: actionTypesOf(scope),
      operators: operatorsOf(scope),
    }),
    [scope],
  );
}
