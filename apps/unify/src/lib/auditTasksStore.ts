import { matchSensitiveText, type RiskLevel } from "@/lib/sensitiveWordsStore";
import { notifyUnify } from "@/lib/useUnifyTick";

export type AuditPass = "pass" | "fail";

export type TrafficLight = "red" | "yellow" | "green";

export type OrderStatus =
  | "pending_audit"
  | "audit_failed"
  | "dci_success"
  | "dci_revoked"
  | "manual_passed";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending_audit: "待审核",
  audit_failed: "未通过审核",
  dci_success: "DCI申领成功",
  dci_revoked: "DCI撤销",
  manual_passed: "人工复核通过",
};

export type WorkCategory = "美术作品" | "摄影作品" | "文字作品" | "视听作品";
export type ApplyType = "常规" | "系列图";
export type ChannelType = "腾讯" | "阿里" | "自有渠道" | "其他";

export type AuditTask = {
  id: string;
  orderId: string;
  workName: string;
  workCategory: WorkCategory;
  applyType: ApplyType;
  ownerName: string;
  ownerId: string;
  submittedAt: string;
  channelType: ChannelType;
  channelName: string;
  updatedAt: string;
  orderStatus: OrderStatus;
  /** 作品描述等文本，用于敏感词判定展示 */
  workDesc: string;
  materials: {
    files: { name: string; size: string }[];
    ownerIdNo: string;
    contact: string;
    extraNote: string;
  };
  audits: {
    contentSafety: {
      result: AuditPass;
      riskLevel: RiskLevel | null;
      hits: { word: string; level: RiskLevel }[];
    };
    duplicateCheck: { result: AuditPass; detail: string };
    infringement: { result: AuditPass; detail: string };
  };
  manualReview?: {
    passedAt: string;
    passedBy: string;
    note: string;
  };
};

const KEY = "ctp.unify.audit-tasks";

function stamp() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function buildSafety(text: string) {
  const m = matchSensitiveText(text);
  return {
    result: (m.failed ? "fail" : "pass") as AuditPass,
    riskLevel: m.riskLevel,
    hits: m.hits,
  };
}

function seedTasks(): AuditTask[] {
  const base = (partial: {
    id: string;
    orderId: string;
    workName: string;
    workCategory: WorkCategory;
    applyType: ApplyType;
    ownerName: string;
    ownerId: string;
    submittedAt: string;
    channelType: ChannelType;
    channelName: string;
    updatedAt: string;
    orderStatus: OrderStatus;
    workDesc: string;
    materials: AuditTask["materials"];
    safetyText?: string;
    dupFail?: boolean;
    infrFail?: boolean;
  }): AuditTask => {
    const text = partial.safetyText ?? partial.workDesc;
    const contentSafety = buildSafety(text);
    const duplicateCheck = {
      result: (partial.dupFail ? "fail" : "pass") as AuditPass,
      detail: partial.dupFail ? "与库内作品高度相似（模拟）" : "未发现重复登记",
    };
    const infringement = {
      result: (partial.infrFail ? "fail" : "pass") as AuditPass,
      detail: partial.infrFail ? "疑似与在先权利冲突（模拟）" : "未发现侵权风险",
    };
    return {
      id: partial.id,
      orderId: partial.orderId,
      workName: partial.workName,
      workCategory: partial.workCategory,
      applyType: partial.applyType,
      ownerName: partial.ownerName,
      ownerId: partial.ownerId,
      submittedAt: partial.submittedAt,
      channelType: partial.channelType,
      channelName: partial.channelName,
      updatedAt: partial.updatedAt,
      orderStatus: partial.orderStatus,
      workDesc: partial.workDesc,
      materials: partial.materials,
      audits: { contentSafety, duplicateCheck, infringement },
    };
  };

  return [
    base({
      id: "t1",
      orderId: "8230615000002328991",
      workName: "今天",
      workCategory: "美术作品",
      applyType: "常规",
      ownerName: "喵馋猫测试零三的公司",
      ownerId: "U90001",
      submittedAt: "2026-03-10 10:11:22",
      channelType: "腾讯",
      channelName: "-",
      updatedAt: "2026-03-10 12:00:00",
      orderStatus: "audit_failed",
      workDesc: "作品名称含测试文案",
      safetyText: "内容含暴恐相关描述，不可发布",
      materials: {
        files: [
          { name: "today_cover.png", size: "1.2 MB" },
          { name: "授权书.pdf", size: "320 KB" },
        ],
        ownerIdNo: "91310000MA1K****",
        contact: "138****0001",
        extraNote: "高危敏感词命中示例",
      },
    }),
    base({
      id: "t2",
      orderId: "8230615000002329002",
      workName: "煎饼",
      workCategory: "摄影作品",
      applyType: "常规",
      ownerName: "李星宇",
      ownerId: "U90002",
      submittedAt: "2026-03-11 09:20:00",
      channelType: "腾讯",
      channelName: "-",
      updatedAt: "2026-03-11 11:00:00",
      orderStatus: "audit_failed",
      workDesc: "街拍摄影",
      safetyText: "标题正常，正文提到赌博宣传",
      dupFail: true,
      materials: {
        files: [{ name: "jianbing.jpg", size: "2.4 MB" }],
        ownerIdNo: "310***********1234",
        contact: "139****2200",
        extraNote: "中危 + 查重失败 → 红灯（内容安全优先）",
      },
    }),
    base({
      id: "t3",
      orderId: "8230615000002330100",
      workName: "格林床头柜",
      workCategory: "美术作品",
      applyType: "系列图",
      ownerName: "设计工作室A",
      ownerId: "U90003",
      submittedAt: "2026-03-12 14:33:01",
      channelType: "阿里",
      channelName: "天猫旗舰",
      updatedAt: "2026-03-12 16:00:00",
      orderStatus: "audit_failed",
      workDesc: "家具产品图",
      safetyText: "正常商品描述，无敏感词",
      infrFail: true,
      materials: {
        files: [
          { name: "cabinet_01.png", size: "800 KB" },
          { name: "cabinet_02.png", size: "790 KB" },
        ],
        ownerIdNo: "91310115MA1H****",
        contact: "021-****8899",
        extraNote: "内容安全通过，侵权不通过 → 黄灯",
      },
    }),
    base({
      id: "t4",
      orderId: "8230615000002330201",
      workName: "春日露营",
      workCategory: "摄影作品",
      applyType: "常规",
      ownerName: "王小明",
      ownerId: "U90004",
      submittedAt: "2026-03-13 08:00:00",
      channelType: "自有渠道",
      channelName: "官网",
      updatedAt: "2026-03-13 08:30:00",
      orderStatus: "dci_success",
      workDesc: "户外摄影作品",
      safetyText: "春日露营记录，风景优美",
      materials: {
        files: [{ name: "camping.zip", size: "18 MB" }],
        ownerIdNo: "110***********5678",
        contact: "136****4455",
        extraNote: "三项均通过 → 绿灯",
      },
    }),
    base({
      id: "t5",
      orderId: "8230615000002330302",
      workName: "促销海报",
      workCategory: "美术作品",
      applyType: "常规",
      ownerName: "营销中心",
      ownerId: "U90005",
      submittedAt: "2026-03-14 17:40:00",
      channelType: "其他",
      channelName: "-",
      updatedAt: "2026-03-14 18:00:00",
      orderStatus: "audit_failed",
      workDesc: "电商海报",
      safetyText: "文案含广告引流话术",
      materials: {
        files: [{ name: "poster.ai", size: "5 MB" }],
        ownerIdNo: "91310000MA1K****",
        contact: "400-***-0000",
        extraNote: "仅低危词 → 低危红灯",
      },
    }),
    base({
      id: "t6",
      orderId: "8230615000002330403",
      workName: "城市夜景",
      workCategory: "摄影作品",
      applyType: "常规",
      ownerName: "赵倩",
      ownerId: "U90006",
      submittedAt: "2026-03-15 11:11:11",
      channelType: "腾讯",
      channelName: "-",
      updatedAt: "2026-03-15 11:20:00",
      orderStatus: "dci_revoked",
      workDesc: "城市摄影",
      safetyText: "无敏感内容",
      dupFail: true,
      materials: {
        files: [{ name: "night.jpg", size: "3.1 MB" }],
        ownerIdNo: "320***********9999",
        contact: "137****7788",
        extraNote: "查重不通过 → 黄灯；订单已撤销",
      },
    }),
  ];
}

function load(): AuditTask[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as AuditTask[];
  } catch {
    /* ignore */
  }
  return seedTasks();
}

let tasks = load();

function persist() {
  localStorage.setItem(KEY, JSON.stringify(tasks));
  notifyUnify();
}

export function listAuditTasks() {
  return tasks.map((t) => ({ ...t, audits: structuredClone(t.audits), materials: structuredClone(t.materials) }));
}

export function getAuditTask(id: string) {
  const t = tasks.find((x) => x.id === id);
  return t
    ? { ...t, audits: structuredClone(t.audits), materials: structuredClone(t.materials) }
    : null;
}

/** 红黄绿：内容安全失败 → 红；其余两项有不过 → 黄；全过 → 绿。人工复核通过视为绿。 */
export function trafficLightOf(task: AuditTask): TrafficLight {
  if (task.manualReview) return "green";
  const { contentSafety, duplicateCheck, infringement } = task.audits;
  if (contentSafety.result === "fail") return "red";
  if (duplicateCheck.result === "fail" || infringement.result === "fail") return "yellow";
  return "green";
}

export function contentRiskLabel(task: AuditTask): string {
  if (task.manualReview) return "—";
  if (task.audits.contentSafety.result === "pass") return "—";
  const lv = task.audits.contentSafety.riskLevel;
  if (lv === "high") return "高危";
  if (lv === "medium") return "中危";
  if (lv === "low") return "低危";
  return "—";
}

export function hasAuditFailure(task: AuditTask) {
  if (task.manualReview) return false;
  const a = task.audits;
  return (
    a.contentSafety.result === "fail" ||
    a.duplicateCheck.result === "fail" ||
    a.infringement.result === "fail"
  );
}

export function manualPassTask(id: string, passedBy: string, note = ""): string | null {
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx < 0) return "任务不存在";
  const prev = tasks[idx]!;
  if (!hasAuditFailure(prev) && !prev.manualReview) return "当前无需人工复核";
  tasks[idx] = {
    ...prev,
    orderStatus: "manual_passed",
    updatedAt: stamp(),
    manualReview: {
      passedAt: stamp(),
      passedBy,
      note: note.trim() || "人工审核通过",
    },
  };
  persist();
  return null;
}

export type AuditTaskFilter = {
  orderId?: string;
  workName?: string;
  workCategory?: string;
  applyType?: string;
  ownerId?: string;
  channelType?: string;
  submittedFrom?: string;
  submittedTo?: string;
  orderStatus?: string;
};

export function filterAuditTasks(f: AuditTaskFilter) {
  return listAuditTasks().filter((t) => {
    if (f.orderId && !t.orderId.includes(f.orderId.trim())) return false;
    if (f.workName && !t.workName.includes(f.workName.trim())) return false;
    if (f.workCategory && t.workCategory !== f.workCategory) return false;
    if (f.applyType && t.applyType !== f.applyType) return false;
    if (f.ownerId && !t.ownerId.includes(f.ownerId.trim())) return false;
    if (f.channelType && t.channelType !== f.channelType) return false;
    if (f.orderStatus && t.orderStatus !== f.orderStatus) return false;
    if (f.submittedFrom && t.submittedAt.slice(0, 10) < f.submittedFrom) return false;
    if (f.submittedTo && t.submittedAt.slice(0, 10) > f.submittedTo) return false;
    return true;
  });
}
