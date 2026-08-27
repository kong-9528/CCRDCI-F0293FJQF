import type { Metadata } from "next";
import { IntegrationGuideClient } from "./IntegrationGuideClient";

export const metadata: Metadata = {
  title: "接入指南",
};

export default function GuidePage() {
  return <IntegrationGuideClient />;
}
