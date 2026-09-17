/** 控制台：历史申请记录（每次提交一条） */
export type ApplyHistoryStatus = "pending" | "withdrawn" | "approved" | "rejected";

export type ApplyHistoryFile = {
  id: string;
  name: string;
  size?: number;
};

export type ApplyHistoryRecord = {
  id: string;
  /** 提交动作时间戳 */
  submittedAt: string;
  status: ApplyHistoryStatus;
  companyName: string;
  /** 组织机构代码 */
  creditCode: string;
  /** 机构地址 */
  address: string;
  /** 合作领域 */
  cooperationField: string;
  contractStart: string;
  contractEnd: string;
  contractFiles: ApplyHistoryFile[];
  contactName: string;
  contactPhone: string;
  /** 不通过时的原因 */
  rejectReason?: string;
};

export const APPLY_HISTORY_STATUS_LABEL: Record<ApplyHistoryStatus, string> = {
  pending: "审核中",
  withdrawn: "已撤回",
  approved: "已通过",
  rejected: "不通过",
};

/** 演示数据：按提交时间倒序；最新一条为当前申请状态 */
export const MOCK_APPLY_HISTORY: ApplyHistoryRecord[] = [
  {
    id: "ah-4",
    submittedAt: "2026-09-05 09:20:00",
    status: "pending",
    companyName: "太极计算机股份有限公司",
    creditCode: "91110000MA01XXXX3K",
    address: "北京市海淀区中关村大街1号",
    cooperationField: "数字版权核验、内容安全审核",
    contractStart: "2026-01-01",
    contractEnd: "2027-12-31",
    contractFiles: [
      { id: "ahf-4a", name: "服务合同.pdf", size: 1_150_000 },
      { id: "ahf-4b", name: "补充协议.pdf", size: 420_000 },
    ],
    contactName: "李四",
    contactPhone: "13800001234",
  },
  {
    id: "ah-3",
    submittedAt: "2026-09-04 15:56:59",
    status: "withdrawn",
    companyName: "太极计算机股份有限公司",
    creditCode: "91110000MA01XXXX3K",
    address: "北京市海淀区中关村大街1号",
    cooperationField: "数字版权核验、内容安全审核",
    contractStart: "2026-01-01",
    contractEnd: "2027-12-31",
    contractFiles: [
      { id: "ahf-3a", name: "服务合同.pdf", size: 1_150_000 },
      { id: "ahf-3b", name: "补充协议.pdf", size: 420_000 },
    ],
    contactName: "李四",
    contactPhone: "13800001234",
  },
  {
    id: "ah-2",
    submittedAt: "2026-08-20 10:12:00",
    status: "rejected",
    companyName: "太极计算机股份有限公司",
    creditCode: "91110000MA01XXXX3K",
    address: "北京市海淀区中关村大街1号",
    cooperationField: "数字内容发行",
    contractStart: "2025-06-01",
    contractEnd: "2026-05-31",
    contractFiles: [{ id: "ahf-2a", name: "开通申请合同.pdf", size: 980_000 }],
    contactName: "李四",
    contactPhone: "13800001234",
    rejectReason: "合同起止日期与营业执照登记信息不一致，请核对后重新提交。",
  },
  {
    id: "ah-1",
    submittedAt: "2026-03-12 09:30:00",
    status: "approved",
    companyName: "太极计算机股份有限公司",
    creditCode: "91110000MA01XXXX3K",
    address: "北京市海淀区中关村大街1号",
    cooperationField: "数字版权登记与数据运营",
    contractStart: "2025-01-01",
    contractEnd: "2026-12-31",
    contractFiles: [
      { id: "ahf-1a", name: "服务合同.pdf", size: 1_150_000 },
      { id: "ahf-1b", name: "补充协议.pdf", size: 420_000 },
    ],
    contactName: "李四",
    contactPhone: "13800001234",
  },
];
