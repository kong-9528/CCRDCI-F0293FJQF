import type { Metadata } from "next";
import { PLATFORM_NAME } from "@/lib/content";

export const metadata: Metadata = {
  title: "用户协议",
};

export default function TermsPage() {
  return (
    <div className="p-page">
      <div className="p-container p-page__prose">
        <h1 className="p-h1">用户协议</h1>
        <p>
          欢迎使用{PLATFORM_NAME}。注册、登录或使用本平台服务，即表示您已阅读并同意本协议。
        </p>
        <h2>账号注册</h2>
        <p>
          您须使用真实、合法的信息进行注册。账号名与手机号均需唯一。请妥善保管账号与密码，对账号下的操作负责。
        </p>
        <h2>服务使用</h2>
        <p>
          平台为企业客户提供版权核验与智能辅助审核等能力。具体产品范围、调用额度与计费以合同及开通配置为准。
        </p>
        <h2>禁止行为</h2>
        <p>
          不得利用平台从事违法违规活动，不得攻击、滥用接口，不得倒卖账号或密钥，不得未经授权访问他人数据。
        </p>
        <h2>协议变更</h2>
        <p>
          我们可能适时更新本协议。重大变更将通过门户公告或其他合理方式提示。继续使用服务即视为接受更新后的协议。
        </p>
        <h2>联系我们</h2>
        <p>如对本协议有疑问，请通过「联系我们」页面与商务或支持渠道沟通。</p>
      </div>
    </div>
  );
}
