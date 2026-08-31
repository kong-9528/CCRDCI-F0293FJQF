import { useMemo } from "react";

/** DCI®技术服务中心（客户控制台）/ 运营后台 */
export type OpLogScope = "portal" | "ops";

export type OpLog = {
  id: string;
  scope: OpLogScope;
  /** 客户控制台日志：所属客户账号 ID */
  customerId?: string;
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

/** 各端操作类型（mock，对齐当前 customer / ops 能力；详见 docs/documents/操作日志-Mock示例.md） */
export const PORTAL_ACTION_TYPES: { value: string; label: string }[] = [
  { value: "login", label: "登录" },
  { value: "logout", label: "退出登录" },
  { value: "change_password", label: "修改密码" },
  { value: "account_profile_edit", label: "编辑机构联系人" },
  { value: "onboarding_submit", label: "提交入驻申请" },
  { value: "onboarding_withdraw", label: "撤回入驻申请" },
  { value: "verify_single", label: "单次核验" },
  { value: "verify_batch", label: "批量核验" },
  { value: "view_result", label: "查看结果" },
  { value: "download_cert", label: "下载证书文件" },
  { value: "audit_submit", label: "提交智能审核" },
  { value: "apikey_create", label: "创建 API Key" },
  { value: "apikey_enable", label: "启用 API Key" },
  { value: "apikey_disable", label: "禁用 API Key" },
  { value: "apikey_reset", label: "重置 API Key" },
  { value: "apikey_delete", label: "删除 API Key" },
];

export const OPS_ACTION_TYPES: { value: string; label: string }[] = [
  { value: "login", label: "登录" },
  { value: "logout", label: "退出登录" },
  { value: "application_approve", label: "审核通过开通申请" },
  { value: "application_reject", label: "拒绝开通申请" },
  { value: "customer_create", label: "新增客户" },
  { value: "customer_edit", label: "编辑客户" },
  { value: "customer_status", label: "启用/停用客户" },
  { value: "customer_password_reset", label: "重置客户密码" },
  { value: "contract_create", label: "新增客户合同" },
  { value: "contract_edit", label: "编辑客户合同" },
  { value: "service_edit", label: "编辑产品服务" },
  { value: "service_stop", label: "停止客户产品服务" },
  { value: "service_resume", label: "恢复客户产品服务" },
  { value: "product_shelf", label: "产品上架/下架" },
  { value: "capability_shelf", label: "审核子能力上架/下架" },
  { value: "api_create", label: "新增接口" },
  { value: "api_edit", label: "编辑接口" },
  { value: "api_status", label: "接口上线/下线" },
  { value: "portal_home_publish", label: "发布门户内容" },
  { value: "portal_home_withdraw", label: "撤回门户内容" },
  { value: "portal_theme_visibility", label: "门户主题显示/隐藏" },
  { value: "guide_catalog_create", label: "新增指南目录" },
  { value: "guide_article_visibility", label: "指南文章显示/隐藏" },
  { value: "console_help_edit", label: "编辑控制台帮助文章" },
  { value: "console_help_visibility", label: "控制台帮助显示/隐藏" },
  { value: "faq_visibility", label: "FAQ 显示/隐藏" },
  { value: "role_perms", label: "配置角色权限" },
  { value: "user_create", label: "新增运营用户" },
  { value: "user_status", label: "启用/停用运营用户" },
];

export function actionTypesOf(scope: OpLogScope) {
  return scope === "portal" ? PORTAL_ACTION_TYPES : OPS_ACTION_TYPES;
}

export function actionTypeLabel(scope: OpLogScope, value: string) {
  return actionTypesOf(scope).find((t) => t.value === value)?.label ?? value;
}

const LOGS: OpLog[] = [
  // —— 客户控制台 portal ——
  {
    id: "p01",
    scope: "portal",
    customerId: "1",
    actionType: "login",
    content: "登录客户控制台",
    operator: "acme_admin",
    operatedAt: "2026-08-29 09:12:03",
  },
  {
    id: "p02",
    scope: "portal",
    customerId: "1",
    actionType: "verify_single",
    content:
      "提交 DCI核验（软件），核验编码 R1138840000985，DCI码 DCI-SW20240001，通道 WebUI",
    operator: "acme_admin",
    operatedAt: "2026-08-29 09:18:41",
  },
  {
    id: "p03",
    scope: "portal",
    customerId: "1",
    actionType: "view_result",
    content: "查看核验结果详情，核验编码 R1138840000985",
    operator: "acme_admin",
    operatedAt: "2026-08-29 09:19:06",
  },
  {
    id: "p04",
    scope: "portal",
    customerId: "1",
    actionType: "verify_batch",
    content: "批量核验上传 120 条（去重后 118 条），产品：版权登记信息核验",
    operator: "acme_ops",
    operatedAt: "2026-08-28 16:42:10",
  },
  {
    id: "p05",
    scope: "portal",
    customerId: "1",
    actionType: "download_cert",
    content:
      "下载核验证书文件，核验编码 R1187530000885，文件 certificate-demo-001.pdf",
    operator: "acme_admin",
    operatedAt: "2026-08-28 11:05:22",
  },
  {
    id: "p06",
    scope: "portal",
    customerId: "1",
    actionType: "verify_single",
    content:
      "提交版权登记证书核验，核验编码 R1187530000888，文件 certificate-001.jpg，通道 WebUI",
    operator: "acme_admin",
    operatedAt: "2026-08-27 10:22:15",
  },
  {
    id: "p07",
    scope: "portal",
    customerId: "1",
    actionType: "apikey_create",
    content: "创建 API Key，AccessKey ID ak_live_a1b2c3d4e5f60718，备注：生产环境主密钥",
    operator: "acme_admin",
    operatedAt: "2026-08-27 14:08:33",
  },
  {
    id: "p08",
    scope: "portal",
    customerId: "1",
    actionType: "apikey_reset",
    content: "重置 API Key，旧密钥已失效，新 AccessKey ID ak_live_9f8e7d6c5b4a3210",
    operator: "acme_admin",
    operatedAt: "2026-08-26 15:40:11",
  },
  {
    id: "p09",
    scope: "portal",
    customerId: "1",
    actionType: "apikey_disable",
    content: "禁用 API Key ak_live_1122334455667788",
    operator: "acme_ops",
    operatedAt: "2026-08-26 16:02:44",
  },
  {
    id: "p10",
    scope: "portal",
    customerId: "1",
    actionType: "audit_submit",
    content:
      "API 提交内容安全审核，产品：作品智能辅助审核 · 内容安全审核，请求 id rs202608251320",
    operator: "acme_ops",
    operatedAt: "2026-08-25 13:20:08",
  },
  {
    id: "p11",
    scope: "portal",
    customerId: "1",
    actionType: "view_result",
    content: "查看内容安全审核调用记录，记录 id rs202608251320",
    operator: "acme_ops",
    operatedAt: "2026-08-25 13:21:40",
  },
  {
    id: "p12",
    scope: "portal",
    customerId: "1",
    actionType: "account_profile_edit",
    content: "更新机构联系人：王敏 / 138****1111 / wangmin@acme.example",
    operator: "acme_admin",
    operatedAt: "2026-08-24 11:15:00",
  },
  {
    id: "p13",
    scope: "portal",
    customerId: "1",
    actionType: "change_password",
    content: "修改登录密码，并注销其他 2 个会话",
    operator: "acme_admin",
    operatedAt: "2026-08-23 18:33:55",
  },
  {
    id: "p14",
    scope: "portal",
    customerId: "1",
    actionType: "logout",
    content: "主动退出登录",
    operator: "acme_admin",
    operatedAt: "2026-08-29 12:01:00",
  },
  {
    id: "p15",
    scope: "portal",
    customerId: "2",
    actionType: "login",
    content: "登录客户控制台",
    operator: "north_admin",
    operatedAt: "2026-08-29 08:40:18",
  },
  {
    id: "p16",
    scope: "portal",
    customerId: "2",
    actionType: "verify_batch",
    content: "批量核验上传 56 条（去重后 54 条），产品：DCI核验",
    operator: "north_admin",
    operatedAt: "2026-08-29 09:05:33",
  },
  {
    id: "p17",
    scope: "portal",
    customerId: "2",
    actionType: "verify_single",
    content:
      "提交版权登记信息核验，核验编码 I2145500000108，登记号 2024SR001234，通道 WebUI",
    operator: "north_editor",
    operatedAt: "2026-08-28 14:18:09",
  },
  {
    id: "p18",
    scope: "portal",
    customerId: "2",
    actionType: "audit_submit",
    content:
      "API 提交作品登记查重，产品：作品智能辅助审核 · 作品登记查重，请求 id rd202608281502",
    operator: "north_editor",
    operatedAt: "2026-08-28 15:02:44",
  },
  {
    id: "p19",
    scope: "portal",
    customerId: "2",
    actionType: "view_result",
    content: "查看作品登记查重结果，记录 id rd202608281502",
    operator: "north_editor",
    operatedAt: "2026-08-28 15:10:12",
  },
  {
    id: "p20",
    scope: "portal",
    customerId: "2",
    actionType: "apikey_create",
    content: "创建 API Key，AccessKey ID ak_live_north001122334455，备注：编辑部只读调用",
    operator: "north_admin",
    operatedAt: "2026-08-27 10:00:00",
  },
  {
    id: "p21",
    scope: "portal",
    customerId: "2",
    actionType: "apikey_enable",
    content: "启用 API Key ak_live_north001122334455",
    operator: "north_admin",
    operatedAt: "2026-08-27 10:05:20",
  },
  {
    id: "p22",
    scope: "portal",
    customerId: "2",
    actionType: "logout",
    content: "主动退出登录",
    operator: "north_admin",
    operatedAt: "2026-08-29 17:30:00",
  },
  {
    id: "p23",
    scope: "portal",
    customerId: "3",
    actionType: "login",
    content: "登录客户控制台",
    operator: "pixel_admin",
    operatedAt: "2026-08-18 09:30:00",
  },
  {
    id: "p24",
    scope: "portal",
    customerId: "3",
    actionType: "audit_submit",
    content:
      "API 提交疑似侵权审核，产品：作品智能辅助审核 · 疑似侵权审核，请求 id ri202608181120",
    operator: "pixel_admin",
    operatedAt: "2026-08-18 11:20:08",
  },
  {
    id: "p25",
    scope: "portal",
    customerId: "3",
    actionType: "view_result",
    content: "查看疑似侵权审核结果，记录 id ri202608181120",
    operator: "pixel_admin",
    operatedAt: "2026-08-18 15:40:22",
  },
  {
    id: "p26",
    scope: "portal",
    customerId: "3",
    actionType: "change_password",
    content: "修改登录密码",
    operator: "pixel_admin",
    operatedAt: "2026-08-17 14:33:55",
  },
  {
    id: "p27",
    scope: "portal",
    customerId: "3",
    actionType: "logout",
    content: "主动退出登录",
    operator: "pixel_admin",
    operatedAt: "2026-08-18 16:00:00",
  },
  {
    id: "p28",
    scope: "portal",
    customerId: "4",
    actionType: "onboarding_submit",
    content: "提交入驻申请，公司：瀚海音乐文化有限公司，合同编号 HT-2026-0809",
    operator: "ocean_contact",
    operatedAt: "2026-08-09 16:20:00",
  },
  {
    id: "p29",
    scope: "portal",
    customerId: "4",
    actionType: "onboarding_withdraw",
    content: "撤回入驻申请（草稿保留）",
    operator: "ocean_contact",
    operatedAt: "2026-08-09 17:05:11",
  },
  {
    id: "p30",
    scope: "portal",
    customerId: "4",
    actionType: "onboarding_submit",
    content: "重新提交入驻申请，公司：瀚海音乐文化有限公司，合同编号 HT-2026-0810",
    operator: "ocean_contact",
    operatedAt: "2026-08-10 09:12:00",
  },
  {
    id: "p31",
    scope: "portal",
    customerId: "4",
    actionType: "login",
    content: "登录客户控制台（开通后首次）",
    operator: "ocean_admin",
    operatedAt: "2026-08-22 10:00:00",
  },
  {
    id: "p32",
    scope: "portal",
    customerId: "4",
    actionType: "apikey_create",
    content: "创建 API Key，AccessKey ID ak_live_ocean998877665544，备注：默认密钥",
    operator: "ocean_admin",
    operatedAt: "2026-08-22 10:15:33",
  },
  {
    id: "p33",
    scope: "portal",
    customerId: "6",
    actionType: "login",
    content: "登录客户控制台",
    operator: "stream_ops",
    operatedAt: "2026-08-26 09:00:12",
  },
  {
    id: "p34",
    scope: "portal",
    customerId: "6",
    actionType: "verify_single",
    content:
      "提交 DCI核验（美术），核验编码 R1199000001234，DCI码 DCI-ART20260801，通道 API",
    operator: "stream_ops",
    operatedAt: "2026-08-26 09:22:40",
  },
  {
    id: "p35",
    scope: "portal",
    customerId: "6",
    actionType: "apikey_delete",
    content: "删除 API Key ak_live_streamdeadbeef01（已确认二次校验）",
    operator: "stream_admin",
    operatedAt: "2026-08-25 18:40:00",
  },

  // —— 运营后台 ops ——
  {
    id: "o01",
    scope: "ops",
    actionType: "login",
    content: "运营账号运营管理员登录成功",
    operator: "运营管理员",
    operatedAt: "2026-08-29 08:55:12",
  },
  {
    id: "o02",
    scope: "ops",
    actionType: "application_approve",
    content:
      "通过开通申请 app-ocean-01，公司：瀚海音乐文化有限公司，账号 ocean_music，开通 版权登记信息核验、版权登记证书核验",
    operator: "运营管理员",
    operatedAt: "2026-08-10 10:05:40",
  },
  {
    id: "o03",
    scope: "ops",
    actionType: "application_reject",
    content: "拒绝开通申请 app-2，公司：某某影业，原因：合同附件不完整",
    operator: "王编辑",
    operatedAt: "2026-08-08 15:28:17",
  },
  {
    id: "o04",
    scope: "ops",
    actionType: "customer_create",
    content: "新增客户账号 zhilian_sz，公司：智联数字版权有限公司",
    operator: "运营管理员",
    operatedAt: "2026-08-21 11:25:00",
  },
  {
    id: "o05",
    scope: "ops",
    actionType: "customer_edit",
    content: "编辑客户 north_press：更新联系人邮箱 liqiang@north.example",
    operator: "王编辑",
    operatedAt: "2026-08-20 15:28:17",
  },
  {
    id: "o06",
    scope: "ops",
    actionType: "customer_status",
    content: "停用客户账号 pixel_lab",
    operator: "运营管理员",
    operatedAt: "2026-08-19 18:02:44",
  },
  {
    id: "o07",
    scope: "ops",
    actionType: "customer_status",
    content: "启用客户账号 legacy_art（合同续签后）",
    operator: "运营管理员",
    operatedAt: "2026-08-01 09:10:00",
  },
  {
    id: "o08",
    scope: "ops",
    actionType: "customer_password_reset",
    content: "重置客户 acme_corp 登录密码",
    operator: "李运营",
    operatedAt: "2026-08-18 09:40:11",
  },
  {
    id: "o09",
    scope: "ops",
    actionType: "contract_create",
    content: "为客户 acme_corp 新增合同 HT000218，2026-09-01~2027-08-31，金额 320000",
    operator: "李运营",
    operatedAt: "2026-08-12 14:20:00",
  },
  {
    id: "o10",
    scope: "ops",
    actionType: "contract_edit",
    content: "编辑客户 acme_corp 合同 HT000218：更新附件「艾克米-续签页.pdf」",
    operator: "李运营",
    operatedAt: "2026-08-12 14:35:22",
  },
  {
    id: "o11",
    scope: "ops",
    actionType: "service_edit",
    content: "调整客户 acme_corp 产品「DCI核验」额度：30000 → 50000",
    operator: "李运营",
    operatedAt: "2026-08-18 09:40:11",
  },
  {
    id: "o12",
    scope: "ops",
    actionType: "service_stop",
    content: "停止客户 pixel_lab 产品「作品智能辅助审核」",
    operator: "运营管理员",
    operatedAt: "2026-05-28 16:40:00",
  },
  {
    id: "o13",
    scope: "ops",
    actionType: "service_resume",
    content: "恢复客户 stream_box 产品「DCI核验」",
    operator: "运营管理员",
    operatedAt: "2026-08-15 10:00:00",
  },
  {
    id: "o14",
    scope: "ops",
    actionType: "product_shelf",
    content: "产品「疑似侵权审核」下架",
    operator: "运营管理员",
    operatedAt: "2026-08-18 13:16:09",
  },
  {
    id: "o15",
    scope: "ops",
    actionType: "product_shelf",
    content: "产品「DCI核验」保持上线（核对货架状态）",
    operator: "运营管理员",
    operatedAt: "2026-08-20 09:00:00",
  },
  {
    id: "o16",
    scope: "ops",
    actionType: "capability_shelf",
    content: "作品智能辅助审核子能力「内容安全审核」上架",
    operator: "王编辑",
    operatedAt: "2026-08-19 11:12:00",
  },
  {
    id: "o17",
    scope: "ops",
    actionType: "api_create",
    content:
      "新增接口 info.verify.batch（POST /v1/info/verify/batch），归属产品：版权登记信息核验",
    operator: "李运营",
    operatedAt: "2026-08-16 10:00:00",
  },
  {
    id: "o18",
    scope: "ops",
    actionType: "api_edit",
    content: "编辑接口 dci.verify.single：更新错误码说明与示例",
    operator: "李运营",
    operatedAt: "2026-08-16 10:22:18",
  },
  {
    id: "o19",
    scope: "ops",
    actionType: "api_status",
    content: "接口「版权登记证书核验 - 批量调用」下线",
    operator: "李运营",
    operatedAt: "2026-08-16 11:08:27",
  },
  {
    id: "o20",
    scope: "ops",
    actionType: "api_status",
    content: "接口「DCI核验 - 单次调用」上线",
    operator: "李运营",
    operatedAt: "2026-08-22 09:30:00",
  },
  {
    id: "o21",
    scope: "ops",
    actionType: "portal_home_publish",
    content: "发布门户内容配置 home-hero-v3（首页焦点区）",
    operator: "王编辑",
    operatedAt: "2026-08-17 16:50:33",
  },
  {
    id: "o22",
    scope: "ops",
    actionType: "portal_home_withdraw",
    content: "撤回门户内容配置 home-hero-v2",
    operator: "王编辑",
    operatedAt: "2026-08-14 11:20:00",
  },
  {
    id: "o23",
    scope: "ops",
    actionType: "portal_theme_visibility",
    content: "门户主题「版权核验场景」设为显示",
    operator: "王编辑",
    operatedAt: "2026-08-13 09:45:00",
  },
  {
    id: "o24",
    scope: "ops",
    actionType: "guide_catalog_create",
    content: "新增指南目录「API 接入」，上级：产品使用，权重 10",
    operator: "王编辑",
    operatedAt: "2026-08-12 10:10:00",
  },
  {
    id: "o25",
    scope: "ops",
    actionType: "guide_article_visibility",
    content: "指南文章「API Key 管理」设为显示",
    operator: "王编辑",
    operatedAt: "2026-08-17 16:50:33",
  },
  {
    id: "o26",
    scope: "ops",
    actionType: "console_help_edit",
    content: "编辑控制台帮助文章「快速开始」(ch-quickstart)",
    operator: "王编辑",
    operatedAt: "2026-08-21 14:00:00",
  },
  {
    id: "o27",
    scope: "ops",
    actionType: "console_help_visibility",
    content: "控制台帮助文章「常见问题」设为隐藏",
    operator: "王编辑",
    operatedAt: "2026-08-21 14:05:00",
  },
  {
    id: "o28",
    scope: "ops",
    actionType: "faq_visibility",
    content: "FAQ「额度不足怎么办？」设为显示",
    operator: "王编辑",
    operatedAt: "2026-08-11 16:00:00",
  },
  {
    id: "o29",
    scope: "ops",
    actionType: "role_perms",
    content: "更新角色「运营编辑」权限节点 12 项（含内容管理、产品货架）",
    operator: "运营管理员",
    operatedAt: "2026-08-10 11:30:00",
  },
  {
    id: "o30",
    scope: "ops",
    actionType: "user_create",
    content: "新增运营用户「李运营」(li_ops)，角色：运营专员",
    operator: "运营管理员",
    operatedAt: "2026-08-09 09:00:00",
  },
  {
    id: "o31",
    scope: "ops",
    actionType: "user_status",
    content: "停用运营用户「试用账号」(trial_ops)",
    operator: "运营管理员",
    operatedAt: "2026-08-08 17:40:00",
  },
  {
    id: "o32",
    scope: "ops",
    actionType: "logout",
    content: "运营管理员退出登录",
    operator: "运营管理员",
    operatedAt: "2026-08-29 19:00:00",
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

/** 客户详情页：该客户在控制台的使用操作日志 */
export function getCustomerPortalLogs(customerId: string): OpLog[] {
  return LOGS.filter((log) => log.scope === "portal" && log.customerId === customerId).sort(
    (a, b) => b.operatedAt.localeCompare(a.operatedAt),
  );
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
