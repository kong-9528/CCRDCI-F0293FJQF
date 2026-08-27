import type { Metadata } from "next";
import { AnalyticsPageClient } from "./AnalyticsPageClient";

export const metadata: Metadata = {
  title: "数据统计分析",
  description:
    "行业专题报告、年度报告与月度报告——覆盖版权登记、查询、核验与智能审核全链路数据分析。",
};

export default function AnalyticsPage() {
  return <AnalyticsPageClient />;
}
