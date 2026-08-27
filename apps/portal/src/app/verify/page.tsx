import type { Metadata } from "next";
import { VerifyPageClient } from "./VerifyPageClient";

export const metadata: Metadata = {
  title: "版权核验",
  description:
    "DCI核验、版权登记信息核验、版权登记证书核验——连接权威登记数据，支撑业务接入、交易确权与合规审查。",
};

export default function VerifyPage() {
  return <VerifyPageClient />;
}
