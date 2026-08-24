import { useState } from "react";
import { Link } from "react-router-dom";
import { Tabs } from "@/components/Tabs";
import { productName } from "@/lib/catalog";
import {
  MOCK_TENANT,
  MOCK_TENANT_CONTRACTS,
  MOCK_TENANT_SERVICES,
  type TenantContract,
} from "@/lib/tenant";

type TabKey = "info" | "services" | "contracts";

const TAB_ITEMS = [
  { key: "info" as const, label: "机构信息" },
  { key: "services" as const, label: "我的服务" },
  { key: "contracts" as const, label: "合同记录" },
];

const PERIOD_LABEL: Record<TenantContract["periodStatus"], string> = {
  active: "合作中",
  pending: "未开始",
  expired: "已到期",
};

function serviceStatusTag(status: (typeof MOCK_TENANT_SERVICES)[number]["status"]) {
  if (status === "stopped") return <span className="a-tag a-tag--muted">已停用</span>;
  if (status === "expiring") return <span className="a-tag a-tag--wn">即将到期</span>;
  return <span className="a-tag a-tag--ok">正常使用</span>;
}

export function AccountCenterPage() {
  const [tab, setTab] = useState<TabKey>("info");

  return (
    <div className="a-card">
      <div className="a-card__head">账号中心</div>
      <Tabs items={TAB_ITEMS} active={tab} onChange={setTab} />
      <div className="a-card__body a-stack">
        {tab === "info" ? (
          <>
            <section className="a-form-section">
              <h3 className="a-form-section__title">企业基本信息（只读）</h3>
              <div className="a-desc">
                <div className="a-desc__item">
                  <span className="a-desc__label">公司全称</span>
                  <span className="a-desc__value">{MOCK_TENANT.companyName}</span>
                </div>
                <div className="a-desc__item">
                  <span className="a-desc__label">统一社会信用代码</span>
                  <span className="a-desc__value">{MOCK_TENANT.creditCode}</span>
                </div>
                <div className="a-desc__item">
                  <span className="a-desc__label">法人代表</span>
                  <span className="a-desc__value">{MOCK_TENANT.legalPerson}</span>
                </div>
              </div>
            </section>
            <section className="a-form-section">
              <h3 className="a-form-section__title">联系信息</h3>
              <div className="a-desc">
                <div className="a-desc__item">
                  <span className="a-desc__label">联系人</span>
                  <span className="a-desc__value">{MOCK_TENANT.contactName}</span>
                </div>
                <div className="a-desc__item">
                  <span className="a-desc__label">联系电话</span>
                  <span className="a-desc__value">{MOCK_TENANT.contactPhone}</span>
                </div>
                <div className="a-desc__item">
                  <span className="a-desc__label">联系邮箱</span>
                  <span className="a-desc__value">{MOCK_TENANT.contactEmail}</span>
                </div>
                <div className="a-desc__item">
                  <span className="a-desc__label">联系地址</span>
                  <span className="a-desc__value">{MOCK_TENANT.address}</span>
                </div>
              </div>
              <p className="a-field__hint" style={{ marginTop: 8 }}>
                编辑联系信息将在后续阶段接入。
              </p>
            </section>
          </>
        ) : null}

        {tab === "services" ? (
          <div className="a-stack">
            {MOCK_TENANT_SERVICES.map((svc) => {
              const pct =
                svc.quotaTotal && svc.quotaTotal > 0
                  ? Math.min(100, Math.round((svc.usedCount / svc.quotaTotal) * 100))
                  : 0;
              return (
                <div
                  key={svc.product}
                  className="a-card"
                  style={svc.status === "stopped" ? { opacity: 0.65 } : undefined}
                >
                  <div className="a-card__body">
                    <div className="a-inline-actions" style={{ justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--n-900)" }}>
                          {productName(svc.product)}
                        </div>
                        <div className="a-field__hint" style={{ marginTop: 4 }}>
                          开通 {svc.openedAt} · 到期 {svc.expireAt}
                          {svc.quotaTotal != null
                            ? ` · 配额 ${svc.usedCount.toLocaleString()} / ${svc.quotaTotal.toLocaleString()}`
                            : " · 不限量"}
                        </div>
                        {svc.quotaTotal != null ? (
                          <div
                            style={{
                              marginTop: 8,
                              height: 6,
                              borderRadius: 3,
                              background: "var(--n-100)",
                              overflow: "hidden",
                              maxWidth: 320,
                            }}
                          >
                            <div
                              style={{
                                width: `${pct}%`,
                                height: "100%",
                                background: "var(--p-600)",
                              }}
                            />
                          </div>
                        ) : null}
                      </div>
                      <div className="a-inline-actions">
                        {serviceStatusTag(svc.status)}
                        <Link to="/api-docs" className="a-btn a-btn--text a-btn--sm">
                          API文档
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        {tab === "contracts" ? (
          <div className="a-stack">
            {MOCK_TENANT_CONTRACTS.map((c) => (
              <div key={c.id} className="a-card">
                <div className="a-card__body">
                  <div className="a-inline-actions" style={{ justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 600 }}>{c.contractNo}</span>
                    <span className="a-tag">{PERIOD_LABEL[c.periodStatus]}</span>
                  </div>
                  <div className="a-desc" style={{ marginTop: 12 }}>
                    <div className="a-desc__item">
                      <span className="a-desc__label">合作起止</span>
                      <span className="a-desc__value">
                        {c.startDate} ~ {c.endDate}
                      </span>
                    </div>
                    <div className="a-desc__item">
                      <span className="a-desc__label">合同金额</span>
                      <span className="a-desc__value">{c.amount.toLocaleString()} 元</span>
                    </div>
                    <div className="a-desc__item a-desc__item--wide">
                      <span className="a-desc__label">附件</span>
                      <span className="a-desc__value">
                        {c.files.map((f) => f.name).join("、")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
