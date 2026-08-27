import type { Metadata } from "next";
import { FaqPageClient } from "./FaqPageClient";

export const metadata: Metadata = {
  title: "常见问题",
};

export default function FaqPage() {
  return <FaqPageClient />;
}
