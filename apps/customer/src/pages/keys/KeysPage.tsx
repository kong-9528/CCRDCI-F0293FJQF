import { useEffect, useState } from "react";
import { Modal } from "@/components/Modal";
import { PaneHeader, PaneIconKey } from "@/components/PaneHeader";
import {
  IconCopy,
  IconEdit,
  IconEye,
  IconEyeOff,
  IconWand,
} from "@/components/icons/UiIcons";
import { SERVICE_TABS, type ServiceTab } from "@/lib/apiStats";
import {
  copyText,
  ensureStoredApiKey,
  generateDek,
  generateSk,
  maskSecret,
  regenerateSecrets,
  saveStoredApiKey,
  type ApiKeyRecord,
} from "@/lib/keys";

type Draft = { ak: string; sk: string; dek: string };

const SECURITY_NOTICE =
  "API Key（含 AK、SK、DEK）属于重要访问凭证，请妥善保管并仅限授权人员使用；请勿通过即时通讯、邮件明文或代码仓库等方式对外泄露。如发生泄露或疑似盗用，请立即重新生成密钥并同步更新业务系统配置。";

const REGEN_WARN =
  "请勿频繁或随意更换密钥。密钥一经更换，使用旧密钥的接口调用将立即失败，需同步将业务系统更新为新密钥后方可恢复正常调用。";

export function KeysPage() {
  const [serviceTab, setServiceTab] = useState<ServiceTab>("verify");
  const [record, setRecord] = useState<ApiKeyRecord | null>(() => ensureStoredApiKey("verify"));
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [copied, setCopied] = useState<"ak" | "sk" | "dek" | null>(null);

  useEffect(() => {
    setRecord(ensureStoredApiKey(serviceTab));
    setRevealed(false);
    setFormOpen(false);
    setDraft(null);
    setCopied(null);
  }, [serviceTab]);

  const persistRecord = (next: ApiKeyRecord) => {
    setRecord(next);
    saveStoredApiKey(next, serviceTab);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const onCopy = async (field: "ak" | "sk" | "dek", value: string) => {
    const ok = await copyText(value);
    if (!ok) {
      showToast("复制失败，请手动选择复制");
      return;
    }
    setCopied(field);
    window.setTimeout(() => setCopied(null), 1000);
    showToast("复制成功");
  };

  const openEdit = () => {
    if (!record) return;
    setDraft({ ak: record.ak, sk: record.sk, dek: record.dek });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setDraft(null);
  };

  const regenSk = () => {
    setDraft((prev) => (prev ? { ...prev, sk: generateSk() } : prev));
    showToast("已生成 SK");
  };
  const regenDek = () => {
    setDraft((prev) => (prev ? { ...prev, dek: generateDek() } : prev));
    showToast("已生成 DEK");
  };
  const regenBoth = () => {
    setDraft((prev) => (prev ? { ...prev, sk: generateSk(), dek: generateDek() } : prev));
    showToast("已重新生成 SK 和 DEK");
  };

  const submitForm = () => {
    if (!draft || !record) return;
    if (!draft.sk || !draft.dek) {
      showToast("请先点击右侧按钮生成 SK 和 DEK");
      return;
    }
    persistRecord(regenerateSecrets(record, { sk: draft.sk, dek: draft.dek }));
    setRevealed(false);
    closeForm();
    showToast("保存成功");
  };

  return (
    <div className="a-stack c-keys-page">
      {toast ? <div className="a-toast">{toast}</div> : null}

      <PaneHeader
        as="h1"
        title="API key管理"
        icon={<PaneIconKey />}
        actions={
          record ? (
            <button type="button" className="a-btn a-btn--primary c-keys-edit-btn" onClick={openEdit}>
              <IconEdit size={14} />
              编辑
            </button>
          ) : null
        }
      />

      <div className="c-stats-service-tabs c-keys-service-tabs" role="tablist" aria-label="服务类型">
        {SERVICE_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={serviceTab === tab.key}
            className={`c-stats-service-tabs__item${serviceTab === tab.key ? " is-active" : ""}`}
            onClick={() => setServiceTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="c-keys-notice">
        <div className="c-keys-notice__item">
          <span className="c-keys-notice__label">安全提醒</span>
          <span className="c-keys-notice__text">{SECURITY_NOTICE}</span>
        </div>
      </div>

      {!record ? (
        <div className="c-keys-empty">
          <p className="c-keys-empty__title">暂未配置 API key</p>
          <p className="c-keys-empty__desc">平台开通后系统将自动下发 AK、SK、DEK，无需自行创建。</p>
        </div>
      ) : (
        <div className="c-keys-detail">
          <div className="c-keys-tiles">
            <KeyTile
              label="AK"
              display={record.ak}
              copied={copied === "ak"}
              onCopy={() => onCopy("ak", record.ak)}
            />
            <KeyTile
              label="SK"
              display={revealed ? record.sk : maskSecret(record.sk)}
              copied={copied === "sk"}
              onCopy={() => onCopy("sk", record.sk)}
            />
            <KeyTile
              label="DEK"
              display={revealed ? record.dek : maskSecret(record.dek)}
              copied={copied === "dek"}
              onCopy={() => onCopy("dek", record.dek)}
            />
          </div>

          <button
            type="button"
            className={`c-keys-reveal-toggle${revealed ? " is-on" : ""}`}
            onClick={() => setRevealed((v) => !v)}
          >
            {revealed ? <IconEyeOff size={16} /> : <IconEye size={16} />}
            {revealed ? "隐藏密钥" : "显示密钥"}
          </button>
        </div>
      )}

      <ApiKeyFormModal
        open={formOpen && Boolean(draft)}
        draft={draft}
        onClose={closeForm}
        onRegenSk={regenSk}
        onRegenDek={regenDek}
        onRegenBoth={regenBoth}
        onSubmit={submitForm}
      />
    </div>
  );
}

function KeyTile({
  label,
  display,
  copied,
  onCopy,
}: {
  label: string;
  display: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="c-keys-tile">
      <div className="c-keys-tile__top">
        <span className="c-keys-tile__label">{label}</span>
        <button
          type="button"
          className="c-keys-tile__copy"
          aria-label={`复制${label}`}
          title={copied ? "已复制" : "复制"}
          onClick={onCopy}
        >
          <IconCopy size={14} />
        </button>
      </div>
      <code className="c-keys-tile__value">{display}</code>
    </div>
  );
}

function ApiKeyFormModal({
  open,
  draft,
  onClose,
  onRegenSk,
  onRegenDek,
  onRegenBoth,
  onSubmit,
}: {
  open: boolean;
  draft: Draft | null;
  onClose: () => void;
  onRegenSk: () => void;
  onRegenDek: () => void;
  onRegenBoth: () => void;
  onSubmit: () => void;
}) {
  if (!draft) return null;

  return (
    <Modal
      open={open}
      title="编辑API key"
      description="系统将自动生成 AK，点击按钮生成 SK / DEK"
      onClose={onClose}
      size="md"
      className="c-keys-form-modal"
      footer={
        <>
          <button type="button" className="a-btn" onClick={onClose}>
            取消
          </button>
          <button type="button" className="a-btn a-btn--primary" onClick={onSubmit}>
            确定
          </button>
        </>
      }
    >
      <div className="c-keys-form">
        <label className="c-keys-form__field">
          <span className="c-keys-form__label">AK</span>
          <input className="a-input c-keys-form__input is-readonly" value={draft.ak} readOnly />
          <span className="c-keys-form__hint">AK 由系统自动生成，不可变更。</span>
        </label>

        <div className="c-keys-form__field">
          <span className="c-keys-form__label">SK</span>
          <div className="c-keys-form__row">
            <input
              className="a-input c-keys-form__input is-muted"
              value={draft.sk}
              readOnly
              placeholder="点击右侧按钮生成 SK"
            />
            <button
              type="button"
              className="c-keys-form__gen"
              aria-label="重新生成 SK"
              title="重新生成 SK"
              onClick={onRegenSk}
            >
              <IconWand size={16} />
            </button>
          </div>
        </div>

        <div className="c-keys-form__field">
          <span className="c-keys-form__label">DEK</span>
          <div className="c-keys-form__row">
            <input
              className="a-input c-keys-form__input is-muted"
              value={draft.dek}
              readOnly
              placeholder="点击右侧按钮生成 DEK"
            />
            <button
              type="button"
              className="c-keys-form__gen"
              aria-label="重新生成 DEK"
              title="重新生成 DEK"
              onClick={onRegenDek}
            >
              <IconWand size={16} />
            </button>
          </div>
        </div>

        <div className="c-keys-form__regen-block">
          <div className="c-keys-form__warn">
            <span className="c-keys-form__warn-label">注意</span>
            <span className="c-keys-form__warn-text">{REGEN_WARN}</span>
          </div>
          <button type="button" className="c-keys-form__regen-all" onClick={onRegenBoth}>
            <IconWand size={16} />
            重新生成 SK / DEK
          </button>
        </div>
      </div>
    </Modal>
  );
}
