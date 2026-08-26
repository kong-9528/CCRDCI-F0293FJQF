import { useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Modal } from "@/components/Modal";
import {
  MAX_API_KEYS,
  createApiKey,
  copyText,
  resetApiKey,
  setApiKeyStatus,
  type ApiKeyRecord,
} from "@/lib/keys";

type RevealPayload = {
  accessKeyId: string;
  secretKey: string;
  mode: "create" | "reset";
};

export function KeysPage() {
  const [keys, setKeys] = useState<ApiKeyRecord[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [reveal, setReveal] = useState<RevealPayload | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiKeyRecord | null>(null);
  const [resetTarget, setResetTarget] = useState<ApiKeyRecord | null>(null);
  const [toggleTarget, setToggleTarget] = useState<ApiKeyRecord | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<"ak" | "sk" | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const onCopy = async (field: "ak" | "sk", value: string) => {
    const ok = await copyText(value);
    if (!ok) {
      showToast("复制失败，请手动选择复制");
      return;
    }
    setCopiedField(field);
    window.setTimeout(() => setCopiedField(null), 1000);
  };

  const openCreate = () => {
    setDescription("");
    setCreateOpen(true);
  };

  const closeCreate = () => {
    setCreateOpen(false);
    setDescription("");
  };

  const doCreate = () => {
    if (keys.length >= MAX_API_KEYS) {
      showToast(`每个用户最多创建 ${MAX_API_KEYS} 个 API Key`);
      return;
    }
    const created = createApiKey(description);
    const { secretKey, ...record } = created;
    setKeys([record]);
    closeCreate();
    setReveal({ accessKeyId: created.accessKeyId, secretKey, mode: "create" });
  };

  const doReset = () => {
    if (!resetTarget) return;
    const next = resetApiKey(resetTarget);
    const { secretKey, ...record } = next;
    setKeys((prev) => prev.map((k) => (k.id === record.id ? record : k)));
    setResetTarget(null);
    setReveal({ accessKeyId: next.accessKeyId, secretKey, mode: "reset" });
    showToast("密钥已重置，旧密钥已失效");
  };

  const doDelete = () => {
    if (!deleteTarget) return;
    setKeys((prev) => prev.filter((k) => k.id !== deleteTarget.id));
    setDeleteTarget(null);
    showToast("API Key 已删除");
  };

  const doToggleStatus = () => {
    if (!toggleTarget) return;
    const nextStatus = toggleTarget.status === "enabled" ? "disabled" : "enabled";
    setKeys((prev) =>
      prev.map((k) => (k.id === toggleTarget.id ? setApiKeyStatus(k, nextStatus) : k)),
    );
    setToggleTarget(null);
    showToast(nextStatus === "enabled" ? "已启用" : "已禁用");
  };

  const closeReveal = () => {
    setReveal(null);
    setCopiedField(null);
  };

  const canCreate = keys.length < MAX_API_KEYS;

  return (
    <div className="a-stack c-keys-page">
      {toast ? <div className="a-toast">{toast}</div> : null}

      <div className="a-card">
        <div className="a-card__head">
          API Keys
          <span className="a-card__extra">用于调用 API 接口时的身份认证</span>
          {canCreate ? (
            <button type="button" className="a-btn a-btn--primary a-btn--sm" onClick={openCreate}>
              创建 API Key
            </button>
          ) : null}
        </div>

        <div className="a-card__body a-card__body--flush">
          {keys.length === 0 ? (
            <div className="c-keys-empty">
              <p className="c-keys-empty__title">尚未创建 API Key</p>
              <p className="c-keys-empty__desc">
                创建后可获取 AccessKey ID 与 SecretKey，用于 API 身份认证。每个用户最多创建{" "}
                {MAX_API_KEYS} 个。
              </p>
              <button type="button" className="a-btn a-btn--primary" onClick={openCreate}>
                创建 API Key
              </button>
            </div>
          ) : (
            <div className="a-table-wrap c-keys-table-wrap">
              <table className="a-table">
                <thead>
                  <tr>
                    <th>AccessKey ID</th>
                    <th>状态</th>
                    <th>创建时间</th>
                    <th>最后使用时间</th>
                    <th>最后使用的服务</th>
                    <th>描述/备注</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map((key) => (
                    <tr key={key.id}>
                      <td>
                        <code>{key.accessKeyId}</code>
                      </td>
                      <td>
                        {key.status === "enabled" ? (
                          <span className="a-tag a-tag--ok">启用</span>
                        ) : (
                          <span className="a-tag a-tag--wn">禁用</span>
                        )}
                      </td>
                      <td>{key.createdAt}</td>
                      <td>{key.lastUsedAt ?? "—"}</td>
                      <td>{key.lastUsedService ?? "—"}</td>
                      <td>
                        <div className="a-cell-clamp" title={key.description || undefined}>
                          {key.description || "—"}
                        </div>
                      </td>
                      <td>
                        <div className="c-keys-actions">
                          <button
                            type="button"
                            className="a-btn a-btn--text a-btn--sm"
                            onClick={() => setToggleTarget(key)}
                          >
                            {key.status === "enabled" ? "禁用" : "启用"}
                          </button>
                          <button
                            type="button"
                            className="a-btn a-btn--text a-btn--sm"
                            onClick={() => setResetTarget(key)}
                          >
                            重置
                          </button>
                          <button
                            type="button"
                            className="a-btn a-btn--text a-btn--sm a-btn--danger-link"
                            onClick={() => setDeleteTarget(key)}
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="a-card">
        <div className="a-card__head">使用说明</div>
        <div className="a-card__body a-stack" style={{ fontSize: "var(--ad-fs-sm)", color: "var(--n-600)" }}>
          <p>SecretKey 仅在创建或重置成功时展示一次，关闭弹窗后将无法再次查看。</p>
          <p>若忘记 SecretKey，请重置密钥对或删除后重新创建；重置后旧密钥立即失效。</p>
          <p>禁用密钥可临时阻断 API 调用，不会删除密钥，可随时重新启用。</p>
        </div>
      </div>

      <Modal
        open={createOpen}
        title="创建 API Key"
        onClose={closeCreate}
        footer={
          <>
            <button type="button" className="a-btn" onClick={closeCreate}>
              取消
            </button>
            <button type="button" className="a-btn a-btn--primary" onClick={doCreate}>
              创建
            </button>
          </>
        }
      >
        <div className="a-field a-field--stack">
          <label className="a-field__label" htmlFor="key-description">
            描述/备注
          </label>
          <input
            id="key-description"
            className="a-input"
            value={description}
            placeholder="例如：生产环境主密钥、测试应用"
            onChange={(e) => setDescription(e.target.value)}
            autoComplete="off"
          />
          <span className="a-field__hint">选填，用于标识密钥用途</span>
        </div>
      </Modal>

      <Modal
        open={reveal !== null}
        title={reveal?.mode === "reset" ? "密钥已重置" : "API Key 创建成功"}
        onClose={closeReveal}
        size="md"
        footer={
          <button type="button" className="a-btn a-btn--primary" onClick={closeReveal}>
            我已保存
          </button>
        }
      >
        {reveal ? (
          <div className="a-stack">
            <div className="c-keys-reveal-warn">
              <div className="c-keys-reveal-warn__title">请立即保存</div>
              <p className="c-keys-reveal-warn__desc">
                SecretKey 仅展示一次。关闭弹窗后将无法再次查看；若遗忘只能删除后重新创建或重置密钥对。
              </p>
            </div>

            <div className="c-keys-field">
              <div className="c-keys-field__label">AccessKey ID</div>
              <div className="c-keys-display">
                <code className="c-keys-value">{reveal.accessKeyId}</code>
                <button
                  type="button"
                  className="a-btn a-btn--text a-btn--sm"
                  onClick={() => onCopy("ak", reveal.accessKeyId)}
                >
                  {copiedField === "ak" ? "已复制" : "复制"}
                </button>
              </div>
            </div>

            <div className="c-keys-field">
              <div className="c-keys-field__label">SecretKey</div>
              <div className="c-keys-display">
                <code className="c-keys-value">{reveal.secretKey}</code>
                <button
                  type="button"
                  className="a-btn a-btn--text a-btn--sm"
                  onClick={() => onCopy("sk", reveal.secretKey)}
                >
                  {copiedField === "sk" ? "已复制" : "复制"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={toggleTarget !== null}
        title={toggleTarget?.status === "enabled" ? "确认禁用 API Key" : "确认启用 API Key"}
        description={
          toggleTarget?.status === "enabled"
            ? "禁用后使用该密钥的 API 调用将立即失败，但密钥不会被删除，后续可重新启用。"
            : "启用后该密钥将恢复正常使用，相关 API 调用将重新生效。"
        }
        confirmText={toggleTarget?.status === "enabled" ? "确认禁用" : "确认启用"}
        danger={toggleTarget?.status === "enabled"}
        onCancel={() => setToggleTarget(null)}
        onConfirm={doToggleStatus}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="确认删除 API Key"
        description="删除后该密钥将无法恢复，使用该密钥的服务将立即中断。"
        confirmText="确认删除"
        danger
        onCancel={() => setDeleteTarget(null)}
        onConfirm={doDelete}
      />

      <ConfirmDialog
        open={resetTarget !== null}
        title="确认重置密钥"
        description="重置将生成新的密钥对（AccessKey ID 与 SecretKey 均会更新），旧密钥立即失效。请确保已通知所有调用方同步更换。"
        confirmText="确认重置"
        danger
        onCancel={() => setResetTarget(null)}
        onConfirm={doReset}
      />
    </div>
  );
}
