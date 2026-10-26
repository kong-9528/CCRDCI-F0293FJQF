import { useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Drawer } from "@/components/Drawer";
import { TableAction } from "@/components/TableAction";
import {
  IconDisable,
  IconEdit,
  IconEnable,
  IconLog,
  IconTrash,
} from "@/components/icons/UiIcons";
import {
  IP_TYPE_LABEL,
  deleteIpWhitelist,
  exportIpWhitelistCsv,
  importIpWhitelistCsv,
  listIpHits,
  listIpWhitelist,
  setIpWhitelistEnabled,
  upsertIpWhitelist,
  type IpType,
  type IpWhitelistItem,
} from "@/lib/ipWhitelistStore";
import { useUnifyTick } from "@/lib/useUnifyTick";

export function IpWhitelistPage() {
  useUnifyTick();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<IpWhitelistItem | null | "new">(null);
  const [hitsFor, setHitsFor] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IpWhitelistItem | null>(null);
  const [form, setForm] = useState({
    type: "single" as IpType,
    expression: "",
    note: "",
    enabled: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const rows = useMemo(() => {
    return listIpWhitelist().filter((r) => {
      if (!q.trim()) return true;
      return r.expression.includes(q.trim()) || r.note.includes(q.trim());
    });
  }, [q]);

  const openNew = () => {
    setForm({ type: "single", expression: "", note: "", enabled: true });
    setError(null);
    setEditing("new");
  };

  const openEdit = (r: IpWhitelistItem) => {
    setForm({ type: r.type, expression: r.expression, note: r.note, enabled: r.enabled });
    setError(null);
    setEditing(r);
  };

  const save = () => {
    const err = upsertIpWhitelist({
      id: editing && editing !== "new" ? editing.id : undefined,
      ...form,
    });
    if (err) {
      setError(err);
      return;
    }
    setEditing(null);
    setMsg("已保存");
  };

  return (
    <>
      <div className="a-card">
        <div className="a-card__head">
          IP白名单管理
          <span className="a-card__extra a-muted">
            单 IP / IP 段 / CIDR；与黑名单并存时黑名单优先
          </span>
        </div>

        <div className="a-toolbar">
          <div className="a-field">
            <span className="a-field__label">关键词</span>
            <input
              className="a-input"
              style={{ minWidth: 200 }}
              placeholder="表达式 / 备注"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <button type="button" className="a-btn a-btn--primary" onClick={openNew}>
            新增
          </button>
          <button
            type="button"
            className="a-btn"
            onClick={() => {
              const raw = window.prompt("粘贴 CSV（类型,表达式,备注）", "单IP,1.2.3.4,备注");
              if (!raw) return;
              const r = importIpWhitelistCsv(raw);
              setMsg(`导入成功 ${r.ok} 条${r.fail.length ? `；失败：${r.fail.join("；")}` : ""}`);
            }}
          >
            批量导入
          </button>
          <button
            type="button"
            className="a-btn"
            onClick={() => {
              const blob = new Blob([exportIpWhitelistCsv()], { type: "text/csv;charset=utf-8" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "ip-whitelist.csv";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            导出
          </button>
        </div>

        {msg ? <div className="a-muted" style={{ padding: "0 16px 8px" }}>{msg}</div> : null}

        <div className="a-card__body a-card__body--flush">
          <table className="a-table">
            <thead>
              <tr>
                <th>类型</th>
                <th>表达式</th>
                <th>备注</th>
                <th>状态</th>
                <th>命中次数</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="a-empty">暂无记录</div>
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id}>
                    <td>{IP_TYPE_LABEL[r.type]}</td>
                    <td>
                      <code>{r.expression}</code>
                    </td>
                    <td>{r.note || "—"}</td>
                    <td>{r.enabled ? "启用" : "停用"}</td>
                    <td>{r.hitCount}</td>
                    <td>{r.createdAt}</td>
                    <td>
                      <div className="a-actions">
                        <TableAction icon={<IconEdit />} onClick={() => openEdit(r)}>
                          编辑
                        </TableAction>
                        <TableAction
                          icon={r.enabled ? <IconDisable /> : <IconEnable />}
                          onClick={() => setIpWhitelistEnabled(r.id, !r.enabled)}
                        >
                          {r.enabled ? "停用" : "启用"}
                        </TableAction>
                        <TableAction icon={<IconLog />} onClick={() => setHitsFor(r.id)}>
                          命中明细
                        </TableAction>
                        <TableAction
                          icon={<IconTrash />}
                          danger
                          onClick={() => setDeleteTarget(r)}
                        >
                          删除
                        </TableAction>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing ? (
        <div className="a-modal-backdrop" role="presentation" onClick={() => setEditing(null)}>
          <div
            className="a-modal a-modal--md"
            role="dialog"
            aria-modal
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="a-modal__title">{editing === "new" ? "新增 IP 白名单" : "编辑 IP 白名单"}</h3>
            <div className="a-form a-form--modal a-form--stack">
              <div className="a-field a-field--stack">
                <span className="a-field__label">类型</span>
                <select
                  className="a-select"
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as IpType }))}
                >
                  <option value="single">单IP</option>
                  <option value="range">IP段</option>
                  <option value="cidr">CIDR</option>
                </select>
              </div>
              <div className="a-field a-field--stack">
                <span className="a-field__label">
                  表达式 <span className="a-req">*</span>
                </span>
                <input
                  className="a-input"
                  placeholder={
                    form.type === "cidr"
                      ? "10.0.0.0/24"
                      : form.type === "range"
                        ? "192.168.1.1-192.168.1.50"
                        : "203.0.113.10"
                  }
                  value={form.expression}
                  onChange={(e) => setForm((f) => ({ ...f, expression: e.target.value }))}
                />
              </div>
              <div className="a-field a-field--stack">
                <span className="a-field__label">备注</span>
                <input
                  className="a-input"
                  value={form.note}
                  onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                />
              </div>
              <label className="a-field" style={{ gap: 8 }}>
                <input
                  type="checkbox"
                  checked={form.enabled}
                  onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))}
                />
                <span className="a-field__label">启用</span>
              </label>
            </div>
            {error ? <div className="a-form-error">{error}</div> : null}
            <div className="a-modal__actions">
              <button type="button" className="a-btn" onClick={() => setEditing(null)}>
                取消
              </button>
              <button type="button" className="a-btn a-btn--primary" onClick={save}>
                保存
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <Drawer open={!!hitsFor} title="命中明细" onClose={() => setHitsFor(null)}>
        <table className="a-table">
          <thead>
            <tr>
              <th>时间</th>
              <th>来源 IP</th>
              <th>关联申领记录ID</th>
            </tr>
          </thead>
          <tbody>
            {hitsFor && listIpHits(hitsFor).length === 0 ? (
              <tr>
                <td colSpan={3}>
                  <div className="a-empty">暂无命中</div>
                </td>
              </tr>
            ) : (
              hitsFor &&
              listIpHits(hitsFor).map((h) => (
                <tr key={h.id}>
                  <td>{h.at}</td>
                  <td>{h.source}</td>
                  <td>{h.orderId ? <code>{h.orderId}</code> : "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Drawer>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="确认删除"
        description={deleteTarget ? `确定删除「${deleteTarget.expression}」吗？` : ""}
        confirmText="删除"
        danger
        onConfirm={() => {
          if (deleteTarget) deleteIpWhitelist(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
