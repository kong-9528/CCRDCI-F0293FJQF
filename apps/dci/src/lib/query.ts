export type DciQueryRecord = {
  id: string;
  title: string;
  type: string;
  holder: string;
  date: string;
  center: string;
  status: "已登记" | "已撤销";
};

export const DCI_QUERY_DAILY_LIMIT = 20;
export const DCI_QUERY_STORAGE_KEY = "dci-portal-query-quota";

export const DCI_QUERY_EXAMPLE =
  "例如：DCI:RANTQZ010.156.2026070120989764467  《数字版权保护技术规范》";

export const MOCK_DCI_QUERY_RECORDS: DciQueryRecord[] = [
  {
    id: "DCI:RANTQZ010.156.2026070120989764467",
    title: "《数字版权保护技术规范》",
    type: "文字作品",
    holder: "中国版权保护中心",
    date: "2026-6-24",
    center: "北京版权登记中心",
    status: "已登记",
  },
  {
    id: "DCI:RXHSRM001.156.2025070109897644678",
    title: "《区块链版权存证应用指南》",
    type: "文字作品",
    holder: "北京版权局",
    date: "2026-6-23",
    center: "北京版权登记中心",
    status: "已登记",
  },
  {
    id: "DCI:RANTQZ010.156.2025070109897676670",
    title: "《人工智能生成内容版权认定标准》",
    type: "文字作品",
    holder: "国家版权局",
    date: "2026-6-22",
    center: "北京版权登记中心",
    status: "已撤销",
  },
  {
    id: "DCI:RXHSQZ010.156.2025070107542579810",
    title: "《数字内容版权交易协议》",
    type: "文字作品",
    holder: "版权保护联盟",
    date: "2026-6-21",
    center: "北京版权登记中心",
    status: "已登记",
  },
  {
    id: "DCI:RXHSBJDST.156.2025070107542908765",
    title: "《网络文学版权保护管理办法》",
    type: "文字作品",
    holder: "中国作协",
    date: "2026-6-20",
    center: "北京版权登记中心",
    status: "已登记",
  },
  {
    id: "DCI:RXHSTJGF.156.2026070120000000001",
    title: "太极股份",
    type: "软件作品",
    holder: "太极计算机股份有限公司",
    date: "2026-6-18",
    center: "北京版权登记中心",
    status: "已登记",
  },
  {
    id: "DCI:RXHSTJGF.156.2026070120000000002",
    title: "太极股份智能营销平台",
    type: "软件作品",
    holder: "太极计算机股份有限公司",
    date: "2026-6-17",
    center: "北京版权登记中心",
    status: "已登记",
  },
  {
    id: "DCI:RXHSTJGF.156.2026070120000000003",
    title: "太极股份电子商务系统",
    type: "软件作品",
    holder: "太极计算机股份有限公司",
    date: "2026-6-16",
    center: "北京版权登记中心",
    status: "已撤销",
  },
];

function todayKey() {
  const d = new Date();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function getDailyQueryQuota(): { used: number; remain: number; limit: number } {
  if (typeof window === "undefined") {
    return { used: 0, remain: DCI_QUERY_DAILY_LIMIT, limit: DCI_QUERY_DAILY_LIMIT };
  }
  try {
    const raw = window.localStorage.getItem(DCI_QUERY_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as { date?: string; used?: number }) : null;
    if (!parsed || parsed.date !== todayKey()) {
      return { used: 0, remain: DCI_QUERY_DAILY_LIMIT, limit: DCI_QUERY_DAILY_LIMIT };
    }
    const used = Math.max(0, Number(parsed.used) || 0);
    return {
      used,
      remain: Math.max(0, DCI_QUERY_DAILY_LIMIT - used),
      limit: DCI_QUERY_DAILY_LIMIT,
    };
  } catch {
    return { used: 0, remain: DCI_QUERY_DAILY_LIMIT, limit: DCI_QUERY_DAILY_LIMIT };
  }
}

export function consumeDailyQueryQuota(): { ok: boolean; remain: number; limit: number; message?: string } {
  const current = getDailyQueryQuota();
  if (current.remain <= 0) {
    return {
      ok: false,
      remain: 0,
      limit: current.limit,
      message: "当日查询次数已达上限！",
    };
  }
  const used = current.used + 1;
  window.localStorage.setItem(
    DCI_QUERY_STORAGE_KEY,
    JSON.stringify({ date: todayKey(), used }),
  );
  return {
    ok: true,
    remain: Math.max(0, DCI_QUERY_DAILY_LIMIT - used),
    limit: DCI_QUERY_DAILY_LIMIT,
  };
}

export function searchDciRecords(dciCode: string, keyword: string): DciQueryRecord[] {
  const code = dciCode.trim();
  const key = keyword.trim();
  return MOCK_DCI_QUERY_RECORDS.filter(
    (row) => row.id === code && (row.title === key || row.holder === key),
  );
}
