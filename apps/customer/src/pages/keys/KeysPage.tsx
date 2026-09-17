import { useEffect, useState } from "react";
import { Modal } from "@/components/Modal";
import {
  IconCopy,
  IconEdit,
  IconEye,
  IconEyeOff,
  IconPlus,
  IconRefresh,
  IconShieldCheck,
  IconWand,
} from "@/components/icons/UiIcons";
import { SERVICE_TABS, type ServiceTab } from "@/lib/apiStats";
import {
  copyText,
  createApiKeyDraft,
  createApiKeyFromDraft,
  generateDek,
  generateSk,
  loadStoredApiKey,
  maskSecret,
  regenerateSecrets,
  saveStoredApiKey,
  type ApiKeyRecord,
} from "@/lib/keys";

type Draft = { ak: string; sk: string; dek: string };
type FormMode = "create" | "edit";

export function KeysPage() {
  const [serviceTab, setServiceTab] = useState<ServiceTab>("verify");
  const [record, setRecord] = useState<ApiKeyRecord | null>(() => loadStoredApiKey("verify"));
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [copied, setCopied] = useState<"ak" | "sk" | "dek" | null>(null);

  useEffect(() => {
    setRecord(loadStoredApiKey(serviceTab));
    setRevealed(false);
    setFormOpen(false);
    setDraft(null);
    setCopied(null);
  }, [serviceTab]);

  const persistRecord = (next: ApiKeyRecord | null) => {
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
    showToast("已复制");
  };

  const openCreate = () => {
    if (record) {
      showToast("每个注册中心仅允许创建一个API key");
      return;
    }
    setFormMode("create");
    setDraft(createApiKeyDraft());
    setFormOpen(true);
  };

  const openEdit = () => {
    if (!record) return;
    setFormMode("edit");
    setDraft({ ak: record.ak, sk: record.sk, dek: record.dek });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setDraft(null);
  };

  const regenSk = () => setDraft((prev) => (prev ? { ...prev, sk: generateSk() } : prev));
  const regenDek = () => setDraft((prev) => (prev ? { ...prev, dek: generateDek() } : prev));
  const regenBoth = () =>
    setDraft((prev) => (prev ? { ...prev, sk: generateSk(), dek: generateDek() } : prev));

  const submitForm = () => {
    if (!draft) return;
    if (formMode === "create") {
      if (record) {
        showToast("每个注册中心仅允许创建一个API key");
        return;
      }
      const next = createApiKeyFromDraft(draft);
      persistRecord(next);
      setRevealed(false);
      closeForm();
      showToast("API key 已创建");
      return;
    }
    if (!record) return;
    persistRecord(regenerateSecrets(record, { sk: draft.sk, dek: draft.dek }));
    setRevealed(false);
    closeForm();
    showToast("密钥已更新");
  };

  return (
    <div className="a-stack c-keys-page">
      {toast ? <div className="a-toast">{toast}</div> : null}

      <header className="c-keys-hero">
        <div className="c-keys-hero__text">
          <h1 className="c-keys-hero__title">API key管理</h1>
          <p className="c-keys-hero__sub">生成、更新用于接口调用的 AK、SK、DEK 信息</p>
        </div>
      </header>

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

      {!record ? (
        <div className="a-card c-keys-empty-card">
          <div className="c-keys-empty">
            <p className="c-keys-empty__title">您还没有创建API key</p>
            <p className="c-keys-empty__desc">每个注册中心仅允许创建一个API key</p>
            <button type="button" className="a-btn a-btn--primary" onClick={openCreate}>
              <IconPlus size={14} />
              创建API key
            </button>
          </div>
        </div>
      ) : (
        <div className="a-card c-keys-detail-card">
          <div className="c-keys-detail__head">
            <div className="c-keys-detail__brand">
              <span className="c-keys-detail__shield" aria-hidden>
                <IconShieldCheck size={22} />
              </span>
              <span className="c-keys-detail__name">API key</span>
              <span className="c-keys-detail__time">创建于 {record.createdAt}</span>
            </div>
            <button type="button" className="a-btn a-btn--sm c-keys-detail__edit" onClick={openEdit}>
              <IconEdit size={14} />
              编辑
            </button>
          </div>

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

          <div className="c-keys-detail__foot">
            <button
              type="button"
              className={`c-keys-reveal-toggle${revealed ? " is-on" : ""}`}
              onClick={() => setRevealed((v) => !v)}
            >
              {revealed ? <IconEyeOff size={16} /> : <IconEye size={16} />}
              {revealed ? "隐藏密钥" : "显示密钥"}
            </button>
            {revealed ? (
              <p className="c-keys-detail__caution">
                请妥善保管密钥信息，如不慎泄露，请及时更新密钥信息。
              </p>
            ) : null}
          </div>
        </div>
      )}

      <ApiKeyFormModal
        open={formOpen && Boolean(draft)}
        mode={formMode}
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
  mode,
  draft,
  onClose,
  onRegenSk,
  onRegenDek,
  onRegenBoth,
  onSubmit,
}: {
  open: boolean;
  mode: FormMode;
  draft: Draft | null;
  onClose: () => void;
  onRegenSk: () => void;
  onRegenDek: () => void;
  onRegenBoth: () => void;
  onSubmit: () => void;
}) {
  if (!draft) return null;

  const RegenIcon = mode === "create" ? IconWand : IconRefresh;

  return (
    <Modal
      open={open}
      title={mode === "create" ? "创建API key" : "编辑API key"}
      description={
        mode === "create"
          ? "系统将自动生成 AK，点击按钮生成 SK / DEK"
          : "AK 不可变更，点击按钮重新生成 SK / DEK"
      }
      onClose={onClose}
      size="md"
      className="c-keys-form-modal"
      footer={
        <>
          <button type="button" className="a-btn" onClick={onClose}>
            取消
          </button>
          <button type="button" className="a-btn a-btn--primary" onClick={onSubmit}>
            {mode === "create" ? "确定" : "保存"}
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
            <input className="a-input c-keys-form__input is-muted" value={draft.sk} readOnly />
            <button
              type="button"
              className="c-keys-form__gen"
              aria-label="重新生成 SK"
              title="重新生成 SK"
              onClick={onRegenSk}
            >
              <RegenIcon size={16} />
            </button>
          </div>
        </div>

        <div className="c-keys-form__field">
          <span className="c-keys-form__label">DEK</span>
          <div className="c-keys-form__row">
            <input className="a-input c-keys-form__input is-muted" value={draft.dek} readOnly />
            <button
              type="button"
              className="c-keys-form__gen"
              aria-label="重新生成 DEK"
              title="重新生成 DEK"
              onClick={onRegenDek}
            >
              <RegenIcon size={16} />
            </button>
          </div>
        </div>

        <button type="button" className="c-keys-form__regen-all" onClick={onRegenBoth}>
          <RegenIcon size={16} />
          重新生成 SK / DEK
        </button>

        {mode === "edit" ? (
          <p className="c-keys-form__caution">
            密钥更新后，需同步更新接口调用的密钥信息，请谨慎操作。
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
