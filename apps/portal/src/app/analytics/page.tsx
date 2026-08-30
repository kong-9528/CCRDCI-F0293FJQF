import type { Metadata } from "next";
import { AnalyticsPageClient } from "./AnalyticsPageClient";

export const metadata: Metadata = {
  title: "行业分析报告",
  description:
    "行业专题报告、年度报告与月度报告——覆盖版权登记、查询、核验与智能审核全链路的行业洞察。",
};

export default function AnalyticsPage() {
  return <AnalyticsPageClient />;
}
