import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Modal } from "@/components/Modal";
import { Tabs } from "@/components/Tabs";
import { productName, type ProductCode } from "@/lib/catalog";
import {
  MOCK_TENANT,
  MOCK_TENANT_CONTRACTS,
  MOCK_TENANT_SERVICES,
  type TenantContract,
  type TenantProfile,
} from "@/lib/tenant";

type TabKey = "info" | "services" | "contracts";

type ContactForm = Pick<
  TenantProfile,
  "contactName" | "contactPhone" | "contactEmail" | "address"
>;

const TAB_ITEMS = [
  { key: "info" as const, label: "机构信息" },
  { key: "services" as const, label: "我的服务" },
  { key: "contracts" as const, label: "合同记录" },
];

const PERIOD_LABEL: Record<TenantContract["periodStatus"], string> = {
  active: "生效中",
  pending: "未开始",
  expired: "已到期",
};

const API_DOC_ID: Partial<Record<ProductCode, string>> = {
  dci: "dci",
  info: "info",
  certificate: "cert",
  safety: "safety",
  duplicate: "dedup",
  infringement: "infringe",
};

function serviceStatusTag(status: (typeof MOCK_TENANT_SERVICES)[number]["status"]) {
  if (status === "stopped") return <span className="a-tag a-tag--muted">已停用</span>;
  if (status === "expiring") return <span className="a-tag a-tag--wn">即将到期</span>;
  return <span className="a-tag a-tag--ok">正常使用</span>;
}

function periodTag(status: TenantContract["periodStatus"]) {
  if (status === "active") return <span className="a-tag a-tag--ok">{PERIOD_LABEL[status]}</span>;
  if (status === "pending") return <span className="a-tag a-tag--wn">{PERIOD_LABEL[status]}</span>;
  return <span className="a-tag a-tag--muted">{PERIOD_LABEL[status]}</span>;
}

function validateContact(form: ContactForm): string | null {
  if (!form.contactName.trim()) return "请填写联系人姓名";
  if (!form.contactPhone.trim()) return "请填写联系电话";
  if (!form.contactEmail.trim()) return "请填写联系邮箱";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail.trim())) {
    return "联系邮箱格式不正确";
  }
  return null;
}

export function AccountCenterPage() {
  const location = useLocation();
  const [tab, setTab] = useState<TabKey>("info");
  const [profile, setProfile] = useState<TenantProfile>(() => ({ ...MOCK_TENANT }));
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState<ContactForm>({
    contactName: MOCK_TENANT.contactName,
    contactPhone: MOCK_TENANT.contactPhone,
    contactEmail: MOCK_TENANT.contactEmail,
    address: MOCK_TENANT.address,
  });
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const openEdit = () => {
    setDraft({
      contactName: profile.contactName,
      contactPhone: profile.contactPhone,
      contactEmail: profile.contactEmail,
      address: profile.address,
    });
    setError(null);
    setEditOpen(true);
  };

  const saveContact = () => {
    const err = validateContact(draft);
    if (err) {
      setError(err);
      return;
    }
    setProfile((p) => ({
      ...p,
      contactName: draft.contactName.trim(),
      contactPhone: draft.contactPhone.trim(),
      contactEmail: draft.contactEmail.trim(),
      address: draft.address.trim(),
    }));
    setEditOpen(false);
    showToast("联系信息已更新");
  };

  return (
    <div className="a-card c-account-page">
      {toast ? <div className="a-toast">{toast}</div> : null}
      <div className="a-card__head">账号中心</div>
      <Tabs items={TAB_ITEMS} active={tab} onChange={setTab} className="c-seg-tabs" />
      <div className="a-card__body a-stack">
        {tab === "info" ? (
          <>
            <section className="a-form-section">
              <h3 className="a-form-section__title">
                企业基本信息 <span className="a-field__hint">（只读）</span>
              </h3>
              <div className="a-desc">
                <div className="a-desc__item">
                  <span className="a-desc__label">公司全称</span>
                  <span className="a-desc__value">{profile.companyName}</span>
                </div>
                <div className="a-desc__item">
                  <span className="a-desc__label">统一社会信用代码</span>
                  <span className="a-desc__value">{profile.creditCode}</span>
                </div>
                <div className="a-desc__item">
                  <span className="a-desc__label">法人代表</span>
                  <span className="a-desc__value">{profile.legalPerson}</span>
                </div>
              </div>
            </section>
            <section className="a-form-section">
              <div className="c-account-section-head">
                <h3 className="a-form-section__title" style={{ margin: 0 }}>
                  联系信息{" "}
                  <span className="a-field__hint">（可编辑，修改后保存立即生效）</span>
                </h3>
                <button type="button" className="a-btn a-btn--primary a-btn--sm" onClick={openEdit}>
                  编辑
                </button>
              </div>
              <div className="a-desc" style={{ marginTop: 12 }}>
                <div className="a-desc__item">
                  <span className="a-desc__label">联系人</span>
                  <span className="a-desc__value">{profile.contactName}</span>
                </div>
                <div className="a-desc__item">
                  <span className="a-desc__label">联系电话</span>
                  <span className="a-desc__value">{profile.contactPhone}</span>
                </div>
                <div className="a-desc__item">
                  <span className="a-desc__label">联系邮箱</span>
                  <span className="a-desc__value">{profile.contactEmail}</span>
                </div>
                <div className="a-desc__item a-desc__item--wide">
                  <span className="a-desc__label">联系地址</span>
                  <span className="a-desc__value">{profile.address || "—"}</span>
                </div>
              </div>
            </section>
            <section className="a-form-section">
              <div className="c-account-section-head">
                <h3 className="a-form-section__title" style={{ margin: 0 }}>
                  账号安全
                </h3>
                <Link to="/account/password" className="a-btn a-btn--primary a-btn--sm">
                  修改密码
                </Link>
              </div>
              <p className="a-field__hint" style={{ marginTop: 8 }}>
                修改密码需验证当前密码与绑定邮箱验证码，成功后其他设备会话将自动下线。
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
              const docId = API_DOC_ID[svc.product] ?? svc.product;
              return (
                <div
                  key={svc.product}
                  className={`c-service-card${svc.status === "stopped" ? " is-stopped" : ""}`}
                >
                  <div className="c-service-card__main">
                    <div className="c-service-card__name">{productName(svc.product)}</div>
                    <div className="c-service-card__meta">
                      开通时间：{svc.openedAt} | 到期时间：{svc.expireAt}
                      {svc.quotaTotal != null
                        ? ` | 配额：${svc.usedCount.toLocaleString()} / ${svc.quotaTotal.toLocaleString()}`
                        : " | 配额：不限量"}
                    </div>
                    {svc.quotaTotal != null ? (
                      <div className="c-service-card__bar">
                        <div
                          className={`c-service-card__fill${svc.status === "expiring" ? " is-warn" : ""}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    ) : null}
                  </div>
                  <div className="c-service-card__actions">
                    {serviceStatusTag(svc.status)}
                    <Link
                      to={`/api-docs/${docId}`}
                      state={{ from: `${location.pathname}${location.search}` }}
                      className="a-btn a-btn--text a-btn--sm"
                    >
                      API文档
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        {tab === "contracts" ? (
          <div className="a-stack">
            {MOCK_TENANT_CONTRACTS.map((c) => (
              <div key={c.id} className="c-contract-card">
                <div className="c-contract-card__head">
                  <span className="c-contract-card__no">{c.contractNo}</span>
                  {periodTag(c.periodStatus)}
                </div>
                <div className="a-desc" style={{ marginTop: 12 }}>
                  <div className="a-desc__item">
                    <span className="a-desc__label">合作起止日期</span>
                    <span className="a-desc__value">
                      {c.startDate} ~ {c.endDate}
                    </span>
                  </div>
                  <div className="a-desc__item">
                    <span className="a-desc__label">合同金额</span>
                    <span className="a-desc__value">
                      ¥ {c.amount.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                <div className="c-contract-files">
                  {c.files.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      className="c-contract-file"
                      onClick={() => showToast(`演示：预览 ${f.name}`)}
                      title={f.name}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <span>{f.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <Modal
        open={editOpen}
        title="编辑联系信息"
        onClose={() => setEditOpen(false)}
        footer={
          <>
            <button type="button" className="a-btn" onClick={() => setEditOpen(false)}>
              取消
            </button>
            <button type="button" className="a-btn a-btn--primary" onClick={saveContact}>
              保存
            </button>
          </>
        }
      >
        <div className="a-stack">
          <div className="a-field a-field--stack">
            <label className="a-field__label" htmlFor="contact-name">
              联系人姓名 <span className="c-required">*</span>
            </label>
            <input
              id="contact-name"
              className="a-input"
              value={draft.contactName}
              onChange={(e) => setDraft((d) => ({ ...d, contactName: e.target.value }))}
            />
          </div>
          <div className="a-field a-field--stack">
            <label className="a-field__label" htmlFor="contact-phone">
              联系电话 <span className="c-required">*</span>
            </label>
            <input
              id="contact-phone"
              className="a-input"
              value={draft.contactPhone}
              onChange={(e) => setDraft((d) => ({ ...d, contactPhone: e.target.value }))}
            />
          </div>
          <div className="a-field a-field--stack">
            <label className="a-field__label" htmlFor="contact-email">
              联系邮箱 <span className="c-required">*</span>
            </label>
            <input
              id="contact-email"
              className="a-input"
              value={draft.contactEmail}
              onChange={(e) => setDraft((d) => ({ ...d, contactEmail: e.target.value }))}
            />
          </div>
          <div className="a-field a-field--stack">
            <label className="a-field__label" htmlFor="contact-address">
              有效联系地址
            </label>
            <input
              id="contact-address"
              className="a-input"
              value={draft.address}
              onChange={(e) => setDraft((d) => ({ ...d, address: e.target.value }))}
            />
          </div>
          {error ? <span className="a-field__error">{error}</span> : null}
        </div>
      </Modal>
    </div>
  );
}
