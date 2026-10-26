import { useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { TableAction } from "@/components/TableAction";
import { IconDisable, IconEdit, IconEnable, IconTrash } from "@/components/icons/UiIcons";
import {
  RISK_LEVEL_LABEL,
  deleteSensitiveWord,
  exportSensitiveWordsCsv,
  importSensitiveWordsCsv,
  listSensitiveWords,
  setSensitiveWordEnabled,
  upsertSensitiveWord,
  type RiskLevel,
  type SensitiveWord,
} from "@/lib/sensitiveWordsStore";
import { useUnifyTick } from "@/lib/useUnifyTick";

export function SensitiveWordsPage() {
  useUnifyTick();
  const [q, setQ] = useState("");
  const [level, setLevel] = useState<"" | RiskLevel>("");
  const [editing, setEditing] = useState<SensitiveWord | null | "new">(null);
  const [deleteTarget, setDeleteTarget] = useState<SensitiveWord | null>(null);
  const [form, setForm] = useState({ word: "", level: "medium" as RiskLevel, enabled: true, note: "" });
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const rows = useMemo(() => {
    return listSensitiveWords().filter((w) => {
      if (level && w.level !== level) return false;
      if (q.trim() && !w.word.includes(q.trim())) return false;
      return true;
    });
  }, [q, level]);

  const openNew = () => {
    setForm({ word: "", level: "medium", enabled: true, note: "" });
    setError(null);
    setEditing("new");
  };

  const openEdit = (w: SensitiveWord) => {
    setForm({ word: w.word, level: w.level, enabled: w.enabled, note: w.note });
    setError(null);
    setEditing(w);
  };

  const save = () => {
    const err = upsertSensitiveWord({
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

  const onExport = () => {
    const blob = new Blob([exportSensitiveWordsCsv()], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sensitive-words.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const onImport = () => {
    const raw = window.prompt("粘贴 CSV（词条,危级,备注）", "示例词,高危,备注");
    if (!raw) return;
    const r = importSensitiveWordsCsv(raw);
    setMsg(`导入成功 ${r.ok} 条${r.fail.length ? `；失败：${r.fail.join("；")}` : ""}`);
  };

  return (
    <>
      <div className="a-card">
        <div className="a-card__head">
          敏感词库
          <span className="a-card__extra a-muted">内容安全审核仅匹配启用中的文字敏感词</span>
        </div>

        <div className="a-toolbar">
          <div className="a-field">
            <span className="a-field__label">词条</span>
            <input
              className="a-input"
              placeholder="搜索词条"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="a-field">
            <span className="a-field__label">危级</span>
            <select
              className="a-select"
              value={level}
              onChange={(e) => setLevel(e.target.value as "" | RiskLevel)}
            >
              <option value="">全部</option>
              <option value="high">高危</option>
              <option value="medium">中危</option>
              <option value="low">低危</option>
            </select>
          </div>
          <button type="button" className="a-btn a-btn--primary" onClick={openNew}>
            新增
          </button>
          <button type="button" className="a-btn" onClick={onImport}>
            批量导入
          </button>
          <button type="button" className="a-btn" onClick={onExport}>
            导出
          </button>
        </div>

        {msg ? <div className="a-muted" style={{ padding: "0 16px 8px" }}>{msg}</div> : null}

        <div className="a-card__body a-card__body--flush">
          <table className="a-table">
            <thead>
              <tr>
                <th>词条</th>
                <th>危级</th>
                <th>状态</th>
                <th>备注</th>
                <th>更新时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="a-empty">暂无词条</div>
                  </td>
                </tr>
              ) : (
                rows.map((w) => (
                  <tr key={w.id}>
                    <td>{w.word}</td>
                    <td>
                      <span className={`un-risk un-risk--${w.level}`}>{RISK_LEVEL_LABEL[w.level]}</span>
                    </td>
                    <td>{w.enabled ? "启用" : "停用"}</td>
                    <td>{w.note || "—"}</td>
                    <td>{w.updatedAt}</td>
                    <td>
                      <div className="a-actions">
                        <TableAction icon={<IconEdit />} onClick={() => openEdit(w)}>
                          编辑
                        </TableAction>
                        <TableAction
                          icon={w.enabled ? <IconDisable /> : <IconEnable />}
                          onClick={() => setSensitiveWordEnabled(w.id, !w.enabled)}
                        >
                          {w.enabled ? "停用" : "启用"}
                        </TableAction>
                        <TableAction
                          icon={<IconTrash />}
                          danger
                          onClick={() => setDeleteTarget(w)}
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
            <h3 className="a-modal__title">{editing === "new" ? "新增敏感词" : "编辑敏感词"}</h3>
            <div className="a-form a-form--modal a-form--stack">
              <div className="a-field a-field--stack">
                <span className="a-field__label">
                  词条 <span className="a-req">*</span>
                </span>
                <input
                  className="a-input"
                  value={form.word}
                  onChange={(e) => setForm((f) => ({ ...f, word: e.target.value }))}
                />
              </div>
              <div className="a-field a-field--stack">
                <span className="a-field__label">危级</span>
                <select
                  className="a-select"
                  value={form.level}
                  onChange={(e) => setForm((f) => ({ ...f, level: e.target.value as RiskLevel }))}
                >
                  <option value="high">高危</option>
                  <option value="medium">中危</option>
                  <option value="low">低危</option>
                </select>
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

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="确认删除词条"
        description={deleteTarget ? `确定删除「${deleteTarget.word}」吗？` : ""}
        confirmText="删除"
        danger
        onConfirm={() => {
          if (deleteTarget) deleteSensitiveWord(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
