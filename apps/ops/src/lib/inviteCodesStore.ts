import { useEffect, useState } from "react";

export type InviteCodeStatus = "unused" | "used";

export type InviteCode = {
  id: string;
  code: string;
  remark: string;
  status: InviteCodeStatus;
  /** 已使用时关联的机构名称 */
  companyName?: string;
  createdAt: string;
  updatedAt: string;
};

export const INVITE_CODE_STATUS_LABEL: Record<InviteCodeStatus, string> = {
  unused: "未使用",
  used: "已使用",
};

const CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function generateInviteCode(): string {
  let out = "";
  for (let i = 0; i < 10; i += 1) {
    out += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]!;
  }
  return out;
}

export function isValidInviteCode(code: string): boolean {
  return /^[A-Z0-9]{10}$/.test(code);
}

const MOCK_INVITE_CODES: InviteCode[] = [
  {
    id: "ic-1",
    code: "5DLVU6RYFM",
    remark: "合作伙伴专用",
    status: "unused",
    createdAt: "2026-08-01 10:00:00",
    updatedAt: "2026-08-01 10:00:00",
  },
  {
    id: "ic-2",
    code: "2XS7MMYU2S",
    remark: "市场推广活动",
    status: "unused",
    createdAt: "2026-08-02 11:20:00",
    updatedAt: "2026-08-02 11:20:00",
  },
  {
    id: "ic-3",
    code: "8F4K9PQW3N",
    remark: "内部测试",
    status: "unused",
    createdAt: "2026-08-03 09:15:00",
    updatedAt: "2026-08-03 09:15:00",
  },
  {
    id: "ic-4",
    code: "HGYPE7EXS2",
    remark: "正式上线邀请码",
    status: "used",
    companyName: "云图数字科技有限公司",
    createdAt: "2026-07-20 14:00:00",
    updatedAt: "2026-08-10 16:30:00",
  },
  {
    id: "ic-5",
    code: "V25T8HGJ85",
    remark: "渠道合作",
    status: "used",
    companyName: "江南文创集团有限公司",
    createdAt: "2026-07-18 09:40:00",
    updatedAt: "2026-08-12 10:05:00",
  },
  {
    id: "ic-6",
    code: "K9M2N4P6QR",
    remark: "展会发放",
    status: "unused",
    createdAt: "2026-08-15 13:22:00",
    updatedAt: "2026-08-15 13:22:00",
  },
];

let codes: InviteCode[] = structuredClone(MOCK_INVITE_CODES);
let seq = 100;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function nowStamp() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

export function getInviteCodes(): InviteCode[] {
  return codes;
}

export function getInviteCodeById(id: string): InviteCode | undefined {
  return codes.find((c) => c.id === id);
}

function isCodeTaken(code: string, excludeId?: string): boolean {
  const normalized = code.trim().toUpperCase();
  return codes.some((c) => c.code === normalized && c.id !== excludeId);
}

export function createInviteCode(input: {
  code: string;
  remark: string;
}): string | null {
  const code = input.code.trim().toUpperCase();
  const remark = input.remark.trim();
  if (!isValidInviteCode(code)) {
    return "邀请码须为 10 位大写字母与数字组合";
  }
  if (isCodeTaken(code)) return "邀请码已存在";
  if (remark.length > 30) return "备注最多 30 个字";

  seq += 1;
  const stamp = nowStamp();
  codes = [
    {
      id: `ic-${seq}`,
      code,
      remark,
      status: "unused",
      createdAt: stamp,
      updatedAt: stamp,
    },
    ...codes,
  ];
  emit();
  return null;
}

export function updateInviteCode(
  id: string,
  input: { code: string; remark: string },
): string | null {
  const row = codes.find((c) => c.id === id);
  if (!row) return "邀请码不存在";
  if (row.status === "used") return "已使用的邀请码不可编辑";

  const code = input.code.trim().toUpperCase();
  const remark = input.remark.trim();
  if (!isValidInviteCode(code)) {
    return "邀请码须为 10 位大写字母与数字组合";
  }
  if (isCodeTaken(code, id)) return "邀请码已存在";
  if (remark.length > 30) return "备注最多 30 个字";

  codes = codes.map((c) =>
    c.id === id
      ? {
          ...c,
          code,
          remark,
          updatedAt: nowStamp(),
        }
      : c,
  );
  emit();
  return null;
}

export function deleteInviteCode(id: string): string | null {
  const row = codes.find((c) => c.id === id);
  if (!row) return "邀请码不存在";
  if (row.status === "used") return "已使用的邀请码不可删除";
  codes = codes.filter((c) => c.id !== id);
  emit();
  return null;
}

export function useInviteCodesStore() {
  const [, tick] = useState(0);
  useEffect(() => subscribe(() => tick((n) => n + 1)), []);
  return {
    codes,
    createInviteCode,
    updateInviteCode,
    deleteInviteCode,
    getInviteCodeById,
  };
}
