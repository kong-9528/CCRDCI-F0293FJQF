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
  /** 运营驳回时的原因（仅申请记录可见） */
  rejectReason?: string;
};

export const APPLY_HISTORY_STATUS_LABEL: Record<ApplyHistoryStatus, string> = {
  pending: "审核中",
  withdrawn: "已撤回",
  approved: "已通过",
  rejected: "已驳回",
};

/**
 * 演示数据规则：
 * - 工作台初始为「已通过」，展示最后一次审核通过的机构信息（与 MOCK_TENANT 一致）
 * - 历史中含撤回 / 驳回记录：其提交内容与驳回原因仅在此查看，不回写工作台资料
 */
export const MOCK_APPLY_HISTORY: ApplyHistoryRecord[] = [
  {
    id: "ah-4",
    submittedAt: "2026-09-05 14:28:00",
    status: "withdrawn",
    companyName: "太极计算机股份有限公司",
    creditCode: "91110000MA01XXXX3K",
    address: "北京市海淀区中关村南大街甲 18 号",
    cooperationField: "拟新增内容安全审核、疑似侵权比对能力开通",
    contractStart: "2026-01-01",
    contractEnd: "2028-12-31",
    contractFiles: [
      { id: "ahf-4a", name: "变更申请-合同补充.pdf", size: 860_000 },
      { id: "ahf-4b", name: "变更说明.docx", size: 210_000 },
    ],
    contactName: "王敏",
    contactPhone: "13911112222",
  },
  {
    id: "ah-3",
    submittedAt: "2026-08-20 10:12:00",
    status: "rejected",
    companyName: "太极计算机股份有限公司（变更稿）",
    creditCode: "91110000MA01XXXX3K",
    address: "北京市朝阳区建国路 88 号",
    cooperationField: "数字内容发行、版权运营",
    contractStart: "2026-03-01",
    contractEnd: "2027-02-28",
    contractFiles: [{ id: "ahf-3a", name: "变更申请合同.pdf", size: 980_000 }],
    contactName: "赵强",
    contactPhone: "13700005566",
    rejectReason: "合同起止日期与已备案主合同不一致，请核对后重新提交。",
  },
  {
    id: "ah-1",
    submittedAt: "2026-03-12 09:30:00",
    status: "approved",
    companyName: "太极计算机股份有限公司",
    creditCode: "91110000MA01XXXX3K",
    address: "北京市海淀区中关村大街1号",
    cooperationField: "数字版权核验、内容安全审核",
    contractStart: "2026-01-01",
    contractEnd: "2027-12-31",
    contractFiles: [
      { id: "ahf-1a", name: "服务合同.pdf", size: 1_150_000 },
      { id: "ahf-1b", name: "补充协议.pdf", size: 420_000 },
    ],
    contactName: "李四",
    contactPhone: "13800001234",
  },
];
