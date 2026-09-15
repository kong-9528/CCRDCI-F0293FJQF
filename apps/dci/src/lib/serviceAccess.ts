/** 开通申请状态（与状态机截图一致） */
export type ServiceApplyStatus = "none" | "pending" | "approved" | "rejected";

export type ServiceKind = "registry" | "tech";

/** 展示文案：未提交 / 审核中 / 已通过 / 未通过 */
export const SERVICE_APPLY_STATUS_LABEL: Record<ServiceApplyStatus, string> = {
  none: "未提交",
  pending: "审核中",
  approved: "已通过",
  rejected: "未通过",
};

const CUSTOMER_CONSOLE_URL =
  process.env.NEXT_PUBLIC_CUSTOMER_URL?.replace(/\/$/, "") || "http://localhost:3002";

export type ServiceEntry = {
  kind: ServiceKind;
  name: string;
  description: string;
  applyHref: string;
  workbenchHref: string;
  workbenchExternal?: boolean;
};

export const SERVICE_ENTRIES: ServiceEntry[] = [
  {
    kind: "registry",
    name: "DCI注册中心",
    description:
      "DCI注册中心是经 DCI 管理中心评估认证的DCI 可信生态合作伙伴，负责 DCI 业务的标准化落地与数据运营。",
    applyHref: "/account/apply/registry/",
    workbenchHref: "/dashboard/",
  },
  {
    kind: "tech",
    name: "DCI®技术服务中心",
    description:
      "基于DCI国家标准和全球版权数据中心的可信版权数据，面向机构提供版权核验标准化服务。",
    applyHref: "/account/apply/tech/",
    workbenchHref: CUSTOMER_CONSOLE_URL,
    workbenchExternal: true,
  },
];

export type ServiceStatusSource = {
  registryStatus: ServiceApplyStatus;
  techStatus: ServiceApplyStatus;
};

export function getServiceStatus(user: ServiceStatusSource, kind: ServiceKind): ServiceApplyStatus {
  return kind === "registry" ? user.registryStatus : user.techStatus;
}

export function getServiceStatusLabel(status: ServiceApplyStatus) {
  return SERVICE_APPLY_STATUS_LABEL[status];
}

/** 未提交 / 审核中 / 未通过 → 申请页；已通过 → 工作台 */
export function getServiceCardTarget(user: ServiceStatusSource, entry: ServiceEntry) {
  const status = getServiceStatus(user, entry.kind);
  if (status === "approved") {
    return {
      href: entry.workbenchHref,
      external: Boolean(entry.workbenchExternal),
      status,
    };
  }
  return {
    href: entry.applyHref,
    external: false,
    status,
  };
}

/** 客户提交 / 修改后重新提交 → 审核中 */
export function canSubmitApplication(status: ServiceApplyStatus) {
  return status === "none" || status === "rejected";
}

/** 审核中可撤回 → 未提交 */
export function canWithdrawApplication(status: ServiceApplyStatus) {
  return status === "pending";
}
