import { useState } from "react";
import { Link } from "react-router-dom";
import { Switch } from "@/components/Switch";
import { TableAction } from "@/components/TableAction";
import { IconEdit } from "@/components/icons/UiIcons";
import { usePortalColumnStore, type PortalColumn } from "@/lib/portalColumnStore";

type MetaForm = { name: string; hidden: boolean; sort: string };

export function ColumnManagePage() {
  const store = usePortalColumnStore();
  const [editing, setEditing] = useState<PortalColumn | null>(null);
  const [form, setForm] = useState<MetaForm>({ name: "", hidden: false, sort: "10" });
  const [error, setError] = useState<string | null>(null);

  const openEdit = (row: PortalColumn) => {
    setEditing(row);
    setForm({ name: row.name, hidden: row.hidden, sort: String(row.sort) });
    setError(null);
  };

  const submit = () => {
    if (!editing) return;
    try {
      store.updateMeta(editing.id, {
        name: form.name,
        hidden: form.hidden,
        sort: Number(form.sort || "0"),
      });
      setEditing(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    }
  };

  return (
    <div className="a-stack">
      <div className="a-card">
        <div className="a-card__head">
          栏目管理
          <span className="a-card__extra a-muted">
            定义门户顶部导航栏目；字段结构按各介绍页实际版块配置
          </span>
        </div>
        <div className="a-card__body a-card__body--flush">
          <table className="a-table">
            <thead>
              <tr>
                <th>排序</th>
                <th>栏目名称</th>
                <th>路径</th>
                <th>是否隐藏</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {store.columns.map((row) => (
                <tr key={row.id}>
                  <td>{row.sort}</td>
                  <td>{row.name}</td>
                  <td>
                    <code className="a-code">{row.path}</code>
                  </td>
                  <td>{row.hidden ? "隐藏" : "显示"}</td>
                  <td>
                    <div className="a-inline-actions">
                      <TableAction icon={<IconEdit />} onClick={() => openEdit(row)}>
                        编辑栏目
                      </TableAction>
                      <Link className="a-link-action" to={`/content/columns/${row.id}/edit`}>
                        编辑页面内容
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing ? (
        <div
          className="a-modal-backdrop"
          role="presentation"
          onClick={() => setEditing(null)}
        >
          <div
            className="a-modal a-modal--md"
            role="dialog"
            aria-modal
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="a-modal__title">编辑栏目</h3>
            <div className="a-form a-form--modal a-form--stack">
              <div className="a-field a-field--stack">
                <span className="a-field__label">
                  栏目名称 <span className="a-req">*</span>
                </span>
                <input
                  className="a-input"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="a-field a-field--stack">
                <span className="a-field__label">显示顺序</span>
                <input
                  className="a-input"
                  inputMode="numeric"
                  value={form.sort}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, sort: e.target.value.replace(/[^\d-]/g, "") }))
                  }
                />
                <span className="a-field__hint">数值越小越靠前</span>
              </div>
              <div className="a-field a-field--stack">
                <span className="a-field__label">是否隐藏</span>
                <div className="a-cell-with-action">
                  <span className="a-switch-label">{form.hidden ? "隐藏" : "显示"}</span>
                  <Switch
                    checked={form.hidden}
                    aria-label="是否隐藏栏目"
                    onChange={(next) => setForm((p) => ({ ...p, hidden: next }))}
                  />
                </div>
              </div>
            </div>
            {error ? <div className="a-form-error">{error}</div> : null}
            <div className="a-modal__actions">
              <button type="button" className="a-btn" onClick={() => setEditing(null)}>
                取消
              </button>
              <button type="button" className="a-btn a-btn--primary" onClick={submit}>
                保存
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
