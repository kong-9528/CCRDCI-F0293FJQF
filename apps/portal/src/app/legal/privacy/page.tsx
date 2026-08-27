import type { Metadata } from "next";
import { PLATFORM_NAME } from "@/lib/content";

export const metadata: Metadata = {
  title: "隐私保护",
};

export default function PrivacyPage() {
  return (
    <div className="p-page">
      <div className="p-container p-page__prose">
        <h1 className="p-h1">隐私保护</h1>
        <p>
          {PLATFORM_NAME}重视企业客户与用户的信息安全。我们仅在提供服务、履行合同与合规要求所必需的范围内处理相关信息。
        </p>
        <h2>我们收集的信息</h2>
        <p>
          包括企业账号信息、联系人信息、调用日志、必要的技术日志，以及您通过 WebUI 或 API 提交的业务材料（按产品约定处理）。
        </p>
        <h2>使用目的</h2>
        <p>
          用于身份认证、服务交付、计量计费、安全防护、故障排查与合同履约。不会将您的业务数据出售给第三方。
        </p>
        <h2>存储与安全</h2>
        <p>
          采用合理的访问控制与传输保护措施。API Key 以哈希形式存储；敏感字段在日志中脱敏。
        </p>
        <h2>联系我们</h2>
        <p>
          如对隐私政策有疑问，请通过「联系我们」页面与商务或支持渠道沟通。
        </p>
      </div>
    </div>
  );
}
