import { useState } from "react";
import { ServicePackagesEditor } from "@/components/ServicePackagesEditor";
import { WorkReviewServiceEditor } from "@/components/WorkReviewServiceEditor";
import { IconFaq } from "@/components/NavIcons";
import type { ProductConfigState } from "@/lib/productConfig";

type ConfigTab = "verify" | "audit";

type Props = {
  value: ProductConfigState;
  onChange: (value: ProductConfigState) => void;
  defaultRange?: { startDate: string; endDate: string };
  mode?: "create" | "edit";
  showUsed?: boolean;
  showStatus?: boolean;
};

const VERIFY_RULES_TEXT =
  "规则：版权核验服务共用一套授权总量与生效起止（与作品智能辅助审核同样为单套配置）。其下可从三类核验产品中选择（DCI核验、版权登记信息核验、版权登记证书核验），同一产品不可重复。每个产品需填写每作品消耗次数（正整数），并配置业务类型与 Web页面/API 使用方式；停止/恢复针对单个核验产品。额度仅在生效期内可消耗。已开通的核验服务单元不可整单删除；本次新增可移除。已开通产品不可删除，可停止/恢复；本次新增产品可移除。";

/** 暂时隐藏规则气泡，保留组件便于以后换位置再启用 */
const SHOW_VERIFY_RULES_TIP = false;

function ConfigRulesTip() {
  const [open, setOpen] = useState(false);
  if (!SHOW_VERIFY_RULES_TIP) return null;

  return (
    <div
      className="a-config-rules-tip"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className={`a-config-rules-tip__trigger${open ? " is-open" : ""}`}
        aria-label="查看核验服务配置规则"
        aria-expanded={open}
      >
        <IconFaq className="a-config-rules-tip__icon" />
      </button>
      {open ? (
        <div className="a-config-rules-tip__bubble" role="tooltip">
          <div className="a-config-rules-tip__bubble-title">版权核验服务规则</div>
          <p className="a-config-rules-tip__bubble-body">{VERIFY_RULES_TEXT}</p>
        </div>
      ) : null}
    </div>
  );
}

export function AccountProductConfigPanel({
  value,
  onChange,
  defaultRange,
  mode = "create",
  showUsed = false,
  showStatus = false,
}: Props) {
  const [tab, setTab] = useState<ConfigTab>("verify");

  return (
    <div className="a-stack a-product-config-panel">
      <div className="a-product-config-tabs">
        <div className="a-tabs a-tabs--segment a-tabs--compact" role="tablist">
          <button
            type="button"
            role="tab"
            className={`a-tabs__item${tab === "verify" ? " is-active" : ""}`}
            aria-selected={tab === "verify"}
            onClick={() => setTab("verify")}
          >
            版权核验服务
          </button>
          <button
            type="button"
            role="tab"
            className={`a-tabs__item${tab === "audit" ? " is-active" : ""}`}
            aria-selected={tab === "audit"}
            onClick={() => setTab("audit")}
          >
            作品智能辅助审核服务
          </button>
        </div>
        <ConfigRulesTip />
      </div>

      {tab === "verify" ? (
        <ServicePackagesEditor
          packages={value.packages}
          onChange={(packages) => onChange({ ...value, packages })}
          defaultRange={defaultRange}
          showUsed={showUsed}
          showStatus={showStatus}
          mode={mode}
        />
      ) : (
        <WorkReviewServiceEditor
          value={value.auditService}
          onChange={(auditService) => onChange({ ...value, auditService })}
          defaultRange={defaultRange}
          showUsed={showUsed}
          showStatus={showStatus}
          mode={mode}
        />
      )}
    </div>
  );
}
