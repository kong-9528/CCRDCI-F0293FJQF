import type { Metadata } from "next";
import { PLATFORM_NAME } from "@/lib/content";

export const metadata: Metadata = {
  title: "免责声明",
};

export default function DisclaimerPage() {
  return (
    <div className="p-page">
      <div className="p-container p-page__prose">
        <div className="p-eyebrow">Legal</div>
        <h1 className="p-h1">免责声明</h1>
        <p>
          您通过{PLATFORM_NAME}获取的核验、审核及相关数据服务结果，仅供业务参考。具体权利归属与法律责任仍以权威登记机构记载、合同约定及适用法律为准。
        </p>
        <h2>服务可用性</h2>
        <p>
          我们将尽力保障服务稳定，但不对因网络、上游系统或不可抗力导致的中断、延迟或数据暂时不可用承担超出合同约定范围的责任。
        </p>
        <h2>客户责任</h2>
        <p>
          客户应妥善保管账号与 API Key，对使用本平台接口与 WebUI 产生的操作及后果负责。禁止将服务用于违法违规用途。
        </p>
        <h2>信息准确性</h2>
        <p>
          门户展示的产品介绍、案例与指标可能随版本更新而调整，最终以合同、控制台实际开通范围及接口文档为准。
        </p>
      </div>
    </div>
  );
}
