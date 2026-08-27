import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth";
import { PortalNav } from "@/components/PortalNav";
import { PortalFooter } from "@/components/PortalFooter";
import { PLATFORM_NAME } from "@/lib/content";
import "@ctp/styles/tokens.css";
import "@ctp/styles/portal.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: PLATFORM_NAME,
    template: `%s · ${PLATFORM_NAME}`,
  },
  description: `${PLATFORM_NAME}：版权核验服务（DCI核验、版权登记信息核验、版权登记证书核验）与智能辅助审核服务（内容安全审核、作品登记查重、疑似侵权审核），线下签约开通，按次计量。`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;700&family=Manrope:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="p-portal">
        <AuthProvider>
          <PortalNav />
          <main>{children}</main>
          <PortalFooter />
        </AuthProvider>
      </body>
    </html>
  );
}
