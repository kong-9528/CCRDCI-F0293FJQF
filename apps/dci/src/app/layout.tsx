import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SITE_DESC, SITE_TITLE } from "@/lib/content";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: SITE_TITLE,
    template: `%s · ${SITE_TITLE}`,
  },
  description: SITE_DESC,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SiteHeader />
        <main className="d-main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
