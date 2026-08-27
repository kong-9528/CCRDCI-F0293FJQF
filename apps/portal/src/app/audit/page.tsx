import type { Metadata } from "next";
import { AuditPageClient } from "./AuditPageClient";

export const metadata: Metadata = {
  title: "智能辅助审核",
  description:
    "内容安全审核、作品登记查重、疑似侵权审核——面向登记审核场景的智能辅助研判能力。",
};

export default function AuditPage() {
  return <AuditPageClient />;
}
