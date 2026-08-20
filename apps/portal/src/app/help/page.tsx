import type { Metadata } from "next";
import { HelpCenter } from "./HelpCenterClient";

export const metadata: Metadata = {
  title: "帮助中心",
};

export default function HelpPage() {
  return <HelpCenter />;
}
