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
  "规则：以「套餐包」设定授权总量与生效起止；包内仅可配置三类核验技术服务（DCI核验、版权登记信息核验、版权登记证书核验），不支持配置作品智能辅助审核。同一技术服务不可出现在多个套餐包中。业务类型与 Web页面/API 使用方式配置在技术服务上。套餐额度仅在生效期内可消耗。包内技术服务可随时增减；已停止的套餐包允许暂无技术服务。 已有套餐包不可整包删除，可停止/恢复；本次新增的套餐包可移除。";

function ConfigRulesTip() {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="a-config-rules-tip"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className={`a-config-rules-tip__trigger${open ? " is-open" : ""}`}
        aria-label="查看核验套餐配置规则"
        aria-expanded={open}
      >
        <IconFaq className="a-config-rules-tip__icon" />
      </button>
      {open ? (
        <div className="a-config-rules-tip__bubble" role="tooltip">
          <div className="a-config-rules-tip__bubble-title">核验套餐规则</div>
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
            核验服务
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
