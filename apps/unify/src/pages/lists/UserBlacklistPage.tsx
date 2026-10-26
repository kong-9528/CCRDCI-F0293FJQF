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
import { useAuth } from "@/lib/auth";
import {
  BLACKLIST_DIM_LABEL,
  deleteUserBlacklist,
  exportUserBlacklistCsv,
  importUserBlacklistCsv,
  isBlacklistExpired,
  listBlacklistHits,
  listUserBlacklist,
  setUserBlacklistEnabled,
  upsertUserBlacklist,
  type BlacklistDim,
  type UserBlacklistItem,
} from "@/lib/userBlacklistStore";
import { useUnifyTick } from "@/lib/useUnifyTick";

export function UserBlacklistPage() {
  useUnifyTick();
  const { session } = useAuth();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<UserBlacklistItem | null | "new">(null);
  const [hitsFor, setHitsFor] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserBlacklistItem | null>(null);
  const [form, setForm] = useState({
    dim: "userId" as BlacklistDim,
    value: "",
    effectiveFrom: "2026-01-01 00:00:00",
    effectiveTo: "2099-12-31 23:59:59",
    note: "",
    enabled: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const rows = useMemo(() => {
    return listUserBlacklist().filter((r) => {
      if (!q.trim()) return true;
      return r.value.includes(q.trim()) || r.note.includes(q.trim());
    });
  }, [q]);

  const openNew = () => {
    setForm({
      dim: "userId",
      value: "",
      effectiveFrom: "2026-01-01 00:00:00",
      effectiveTo: "2099-12-31 23:59:59",
      note: "",
      enabled: true,
    });
    setError(null);
    setEditing("new");
  };

  const openEdit = (r: UserBlacklistItem) => {
    setForm({
      dim: r.dim,
      value: r.value,
      effectiveFrom: r.effectiveFrom,
      effectiveTo: r.effectiveTo,
      note: r.note,
      enabled: r.enabled,
    });
    setError(null);
    setEditing(r);
  };

  const save = () => {
    const err = upsertUserBlacklist({
      id: editing && editing !== "new" ? editing.id : undefined,
      ...form,
      createdBy: session?.username || "admin",
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
          用户黑名单管理
          <span className="a-card__extra a-muted">按用户ID / 账号 / 设备ID 管控</span>
        </div>

        <div className="a-toolbar">
          <div className="a-field">
            <span className="a-field__label">关键词</span>
            <input
              className="a-input"
              style={{ minWidth: 200 }}
              placeholder="匹配值 / 备注"
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
              const raw = window.prompt(
                "粘贴 CSV（类型,匹配值,生效,失效,备注）",
                "用户ID,10001,2026-01-01 00:00:00,2099-12-31 23:59:59,备注",
              );
              if (!raw) return;
              const r = importUserBlacklistCsv(raw, session?.username || "admin");
              setMsg(`导入成功 ${r.ok} 条${r.fail.length ? `；失败：${r.fail.join("；")}` : ""}`);
            }}
          >
            批量导入
          </button>
          <button
            type="button"
            className="a-btn"
            onClick={() => {
              const blob = new Blob([exportUserBlacklistCsv()], { type: "text/csv;charset=utf-8" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "user-blacklist.csv";
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
                <th>匹配值</th>
                <th>生效时间</th>
                <th>失效时间</th>
                <th>状态</th>
                <th>备注</th>
                <th>创建</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="a-empty">暂无记录</div>
                  </td>
                </tr>
              ) : (
                rows.map((r) => {
                  const expired = isBlacklistExpired(r);
                  return (
                    <tr key={r.id}>
                      <td>{BLACKLIST_DIM_LABEL[r.dim]}</td>
                      <td>
                        <code>{r.value}</code>
                        {expired ? <span className="un-tag-expired">已过期</span> : null}
                      </td>
                      <td>{r.effectiveFrom}</td>
                      <td>{r.effectiveTo}</td>
                      <td>{r.enabled ? "启用" : "停用"}</td>
                      <td>{r.note || "—"}</td>
                      <td>
                        {r.createdBy}
                        <div className="a-muted" style={{ fontSize: 12 }}>{r.createdAt}</div>
                      </td>
                      <td>
                        <div className="a-actions">
                          <TableAction icon={<IconEdit />} onClick={() => openEdit(r)}>
                            编辑
                          </TableAction>
                          <TableAction
                            icon={r.enabled ? <IconDisable /> : <IconEnable />}
                            onClick={() => setUserBlacklistEnabled(r.id, !r.enabled)}
                          >
                            {r.enabled ? "停用" : "启用"}
                          </TableAction>
                          <TableAction icon={<IconLog />} onClick={() => setHitsFor(r.id)}>
                            命中日志
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
                  );
                })
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
            <h3 className="a-modal__title">{editing === "new" ? "新增黑名单" : "编辑黑名单"}</h3>
            <div className="a-form a-form--modal a-form--stack">
              <div className="a-field a-field--stack">
                <span className="a-field__label">类型</span>
                <select
                  className="a-select"
                  value={form.dim}
                  onChange={(e) => setForm((f) => ({ ...f, dim: e.target.value as BlacklistDim }))}
                >
                  <option value="userId">用户ID</option>
                  <option value="account">账号</option>
                  <option value="deviceId">设备ID</option>
                </select>
              </div>
              <div className="a-field a-field--stack">
                <span className="a-field__label">
                  匹配值 <span className="a-req">*</span>
                </span>
                <input
                  className="a-input"
                  value={form.value}
                  onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                />
              </div>
              <div className="a-field a-field--stack">
                <span className="a-field__label">生效时间</span>
                <input
                  className="a-input"
                  value={form.effectiveFrom}
                  onChange={(e) => setForm((f) => ({ ...f, effectiveFrom: e.target.value }))}
                />
              </div>
              <div className="a-field a-field--stack">
                <span className="a-field__label">失效时间</span>
                <input
                  className="a-input"
                  value={form.effectiveTo}
                  onChange={(e) => setForm((f) => ({ ...f, effectiveTo: e.target.value }))}
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

      <Drawer open={!!hitsFor} title="命中日志" onClose={() => setHitsFor(null)}>
        <table className="a-table">
          <thead>
            <tr>
              <th>时间</th>
              <th>申领记录ID</th>
              <th>维度</th>
              <th>匹配值</th>
            </tr>
          </thead>
          <tbody>
            {hitsFor && listBlacklistHits(hitsFor).length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <div className="a-empty">暂无命中</div>
                </td>
              </tr>
            ) : (
              hitsFor &&
              listBlacklistHits(hitsFor).map((h) => (
                <tr key={h.id}>
                  <td>{h.at}</td>
                  <td>
                    <code>{h.orderId}</code>
                  </td>
                  <td>{BLACKLIST_DIM_LABEL[h.dim]}</td>
                  <td>{h.value}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Drawer>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="确认删除"
        description={deleteTarget ? `确定删除黑名单「${deleteTarget.value}」吗？` : ""}
        confirmText="删除"
        danger
        onConfirm={() => {
          if (deleteTarget) deleteUserBlacklist(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
