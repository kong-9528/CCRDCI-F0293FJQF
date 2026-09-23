import type { ProductCode } from "@/lib/catalog";

export type TenantProfile = {
  companyName: string;
  /** 组织机构代码 */
  creditCode: string;
  contactName: string;
  contactPhone: string;
  /** 机构地址 */
  address: string;
  /** 合作领域 */
  cooperationField: string;
  /** 已核销邀请码（只读展示） */
  inviteCode: string;
};

export type TenantService = {
  product: ProductCode;
  openedAt: string;
  expireAt: string;
  /** 授权总量；核验三类产品共用同一额度池 */
  quotaTotal: number | null;
  /** 该产品自身累计用量（核验产品各自统计） */
  usedCount: number;
  status: "active" | "expiring" | "stopped";
  /**
   * verify = 核验共享池（额度/起止与其它核验产品相同）
   * audit = 独立产品（作品智能辅助审核自有额度与时间）
   */
  entitlement: "verify" | "audit";
  /** 核验产品：每作品消耗次数 */
  consumePerWork?: number;
};

/**
 * 核验服务共享授权（对齐 ops：三类核验产品共用额度与生效起止）。
 * 各产品 usedCount 仍独立。
 */
export const VERIFY_ENTITLEMENT = {
  startDate: "2025-01-01",
  endDate: "2026-09-30",
  quotaTotal: 50000,
} as const;

/** 作品智能辅助审核：独立额度与时间（与 review 页 WORK_REVIEW_ENTITLEMENT 对齐） */
export const AUDIT_ENTITLEMENT = {
  startDate: "2025-06-01",
  endDate: "2026-08-25",
  quotaTotal: 100000,
  usedCount: 105230,
  status: "expiring" as const,
};

export type TenantContract = {
  id: string;
  contractNo: string;
  startDate: string;
  endDate: string;
  amount: number;
  periodStatus: "active" | "pending" | "expired";
  files: { id: string; name: string; size?: number }[];
};

const BRIDGE_KEY = "dci-customer-bridge";

/** Demo users aligned with apps/home mock auth */
const HOME_BRIDGE_USERS: Record<
  string,
  {
    username: string;
    phonenumber: string;
    orgName: string;
    isDciRegistryCenter: boolean;
    isTechService: boolean;
    contactName: string;
  }
> = {
  yachang: {
    username: "yachang",
    phonenumber: "13900001111",
    orgName: "",
    isDciRegistryCenter: false,
    isTechService: false,
    contactName: "雅昌",
  },
  mayi: {
    username: "mayi",
    phonenumber: "13800008000",
    orgName: "太极计算机股份有限公司",
    isDciRegistryCenter: true,
    isTechService: false,
    contactName: "张三",
  },
  mayi1: {
    username: "mayi1",
    phonenumber: "13800008001",
    orgName: "太极计算机股份有限公司",
    isDciRegistryCenter: false,
    isTechService: true,
    contactName: "李四",
  },
  mayi2: {
    username: "mayi2",
    phonenumber: "13800008002",
    orgName: "太极计算机股份有限公司",
    isDciRegistryCenter: true,
    isTechService: true,
    contactName: "王五",
  },
};

export const MOCK_TENANT: TenantProfile = {
  companyName: "太极计算机股份有限公司",
  creditCode: "91110000MA01XXXX3K",
  contactName: "李四",
  contactPhone: "13800001234",
  address: "北京市海淀区中关村大街1号",
  cooperationField: "数字版权核验、内容安全审核",
  inviteCode: "P6R4BHL2",
};

/** 控制台登录会话（演示；可由 home 桥接覆盖） */
export const MOCK_SESSION = {
  /** 登录用户名（顶栏展示） */
  username: "lisi",
  /** 与 home 演示账号对齐；未桥接时按独立控制台演示 */
  bridgeUser: "" as string,
  /** 是否已开通 DCI 注册中心 */
  isDciRegistryCenter: true,
  /** 是否已开通技术服务中心（本应用即该工作台） */
  isTechService: true,
};

/** 门户基址：VITE_DCI_URL，来自部署平台或本地 .env.local */
export const DCI_PORTAL_URL =
  (import.meta.env.VITE_DCI_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:3020";

export const PORTAL_LINKS = {
  home: `${DCI_PORTAL_URL}/`,
  accountCenter: `${DCI_PORTAL_URL}/user/profile`,
  dciRegistryWorkbench: `${DCI_PORTAL_URL}/dashboard/index`,
  applyDciRegistry: `${DCI_PORTAL_URL}/user/profile?tab=open`,
} as const;

type BridgePayload = {
  user: string;
  username: string;
  orgName: string;
  isDciRegistryCenter: boolean;
  isTechService: boolean;
  phonenumber: string;
  contactName: string;
};

function applyBridgeUser(key: string) {
  const u = HOME_BRIDGE_USERS[key];
  if (!u) return false;
  MOCK_SESSION.bridgeUser = key;
  MOCK_SESSION.username = u.username;
  MOCK_SESSION.isDciRegistryCenter = u.isDciRegistryCenter;
  MOCK_SESSION.isTechService = u.isTechService;
  if (u.orgName) MOCK_TENANT.companyName = u.orgName;
  MOCK_TENANT.contactName = u.contactName;
  MOCK_TENANT.contactPhone = u.phonenumber;
  const payload: BridgePayload = {
    user: key,
    username: u.username,
    orgName: u.orgName,
    isDciRegistryCenter: u.isDciRegistryCenter,
    isTechService: u.isTechService,
    phonenumber: u.phonenumber,
    contactName: u.contactName,
  };
  try {
    localStorage.setItem(BRIDGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
  return true;
}

function restoreBridge() {
  try {
    const raw = localStorage.getItem(BRIDGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw) as BridgePayload;
    if (data?.user && HOME_BRIDGE_USERS[data.user]) {
      const u = HOME_BRIDGE_USERS[data.user];
      MOCK_SESSION.bridgeUser = data.user;
      MOCK_SESSION.username = u.username;
      MOCK_SESSION.isDciRegistryCenter = u.isDciRegistryCenter;
      MOCK_SESSION.isTechService = u.isTechService;
      if (u.orgName) MOCK_TENANT.companyName = u.orgName;
      MOCK_TENANT.contactName = u.contactName;
      MOCK_TENANT.contactPhone = u.phonenumber;
      return;
    }
    if (!data?.username) return;
    MOCK_SESSION.username = data.username;
    MOCK_SESSION.isDciRegistryCenter = !!data.isDciRegistryCenter;
    MOCK_SESSION.isTechService = data.isTechService !== false;
    if (data.orgName) MOCK_TENANT.companyName = data.orgName;
    if (data.contactName) MOCK_TENANT.contactName = data.contactName;
    if (data.phonenumber) MOCK_TENANT.contactPhone = data.phonenumber;
  } catch {
    /* ignore */
  }
}

/** 跳回 home 时带上演示用户，并在当前页打开 */
export function portalHref(href: string) {
  if (!MOCK_SESSION.bridgeUser) return href;
  const url = new URL(href);
  url.searchParams.set("from", "customer");
  url.searchParams.set("user", MOCK_SESSION.bridgeUser);
  return url.toString();
}

/** Call once at boot: accept ?from=home&user=mayi1 then strip query */
export function initPortalBridge() {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    const from = params.get("from");
    const user = (params.get("user") || "").trim().toLowerCase();
    if (from === "home" && user && applyBridgeUser(user)) {
      params.delete("from");
      params.delete("user");
      const qs = params.toString();
      const next = `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`;
      window.history.replaceState({}, "", next);
      return;
    }
  } catch {
    /* ignore */
  }
  restoreBridge();
}

export function clearPortalBridge() {
  try {
    localStorage.removeItem(BRIDGE_KEY);
  } catch {
    /* ignore */
  }
}

export const MOCK_TENANT_SERVICES: TenantService[] = [
  {
    product: "dci",
    entitlement: "verify",
    openedAt: VERIFY_ENTITLEMENT.startDate,
    expireAt: VERIFY_ENTITLEMENT.endDate,
    quotaTotal: VERIFY_ENTITLEMENT.quotaTotal,
    usedCount: 12847,
    consumePerWork: 1,
    status: "active",
  },
  {
    product: "info",
    entitlement: "verify",
    openedAt: VERIFY_ENTITLEMENT.startDate,
    expireAt: VERIFY_ENTITLEMENT.endDate,
    quotaTotal: VERIFY_ENTITLEMENT.quotaTotal,
    usedCount: 8432,
    consumePerWork: 1,
    status: "stopped",
  },
  {
    product: "certificate",
    entitlement: "verify",
    openedAt: VERIFY_ENTITLEMENT.startDate,
    expireAt: VERIFY_ENTITLEMENT.endDate,
    quotaTotal: VERIFY_ENTITLEMENT.quotaTotal,
    usedCount: 3188,
    consumePerWork: 2,
    status: "active",
  },
  {
    product: "workReview",
    entitlement: "audit",
    openedAt: AUDIT_ENTITLEMENT.startDate,
    expireAt: AUDIT_ENTITLEMENT.endDate,
    quotaTotal: AUDIT_ENTITLEMENT.quotaTotal,
    usedCount: AUDIT_ENTITLEMENT.usedCount,
    status: AUDIT_ENTITLEMENT.status,
  },
];

/** 核验共享池已用合计（各产品用量之和） */
export function verifyPoolUsedTotal(
  services: TenantService[] = MOCK_TENANT_SERVICES,
): number {
  return services
    .filter((s) => s.entitlement === "verify")
    .reduce((sum, s) => sum + s.usedCount, 0);
}

export const MOCK_TENANT_CONTRACTS: TenantContract[] = [
  {
    id: "c1",
    contractNo: "HT-2026-0088",
    startDate: "2026-01-01",
    endDate: "2027-12-31",
    amount: 280000,
    periodStatus: "active",
    files: [
      { id: "f1", name: "服务合同.pdf", size: 1_150_000 },
      { id: "f2", name: "补充协议.pdf", size: 420_000 },
    ],
  },
];
