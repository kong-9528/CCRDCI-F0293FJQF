import { useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { TableAction } from "@/components/TableAction";
import { IconEdit, IconTrash } from "@/components/icons/UiIcons";
import {
  generateInviteCode,
  INVITE_CODE_STATUS_LABEL,
  useInviteCodesStore,
  type InviteCode,
  type InviteCodeStatus,
} from "@/lib/inviteCodesStore";

type Filters = {
  code: string;
  status: "" | InviteCodeStatus;
};

const EMPTY_FILTERS: Filters = { code: "", status: "" };

type FormState = {
  code: string;
  remark: string;
};

const EMPTY_FORM: FormState = { code: "", remark: "" };

export function InviteCodesPage() {
  const store = useInviteCodesStore();
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS);
  const [dialog, setDialog] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<InviteCode | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<InviteCode | null>(null);

  const filtered = useMemo(() => {
    const codeQ = applied.code.trim().toUpperCase();
    return store.codes.filter((row) => {
      if (codeQ && !row.code.includes(codeQ)) return false;
      if (applied.status && row.status !== applied.status) return false;
      return true;
    });
  }, [store.codes, applied]);

  const openCreate = () => {
    setEditing(null);
    setForm({ code: generateInviteCode(), remark: "" });
    setError(null);
    setDialog("create");
  };

  const openEdit = (row: InviteCode) => {
    if (row.status === "used") return;
    setEditing(row);
    setForm({ code: row.code, remark: row.remark });
    setError(null);
    setDialog("edit");
  };

  const submit = () => {
    if (dialog === "create") {
      const err = store.createInviteCode(form);
      if (err) {
        setError(err);
        return;
      }
      setDialog(null);
      return;
    }
    if (editing) {
      const err = store.updateInviteCode(editing.id, form);
      if (err) {
        setError(err);
        return;
      }
      setDialog(null);
    }
  };

  return (
    <>
      <div className="a-card">
        <div className="a-toolbar">
          <div className="a-field">
            <span className="a-field__label">邀请码</span>
            <input
              className="a-input"
              placeholder="请输入邀请码"
              value={draft.code}
              onChange={(e) => setDraft((p) => ({ ...p, code: e.target.value }))}
            />
          </div>
          <div className="a-field">
            <span className="a-field__label">状态</span>
            <select
              className="a-select"
              value={draft.status}
              onChange={(e) =>
                setDraft((p) => ({
                  ...p,
                  status: e.target.value as Filters["status"],
                }))
              }
            >
              <option value="">全部</option>
              <option value="unused">未使用</option>
              <option value="used">已使用</option>
            </select>
          </div>
          <button
            type="button"
            className="a-btn a-btn--primary"
            onClick={() => setApplied(draft)}
          >
            查询
          </button>
          <button
            type="button"
            className="a-btn"
            onClick={() => {
              setDraft(EMPTY_FILTERS);
              setApplied(EMPTY_FILTERS);
            }}
          >
            重置
          </button>
          <div className="a-toolbar__right">
            <button type="button" className="a-btn a-btn--primary" onClick={openCreate}>
              + 新增
            </button>
          </div>
        </div>

        <div className="a-card__body a-card__body--flush">
          <table className="a-table">
            <thead>
              <tr>
                <th>序号</th>
                <th>邀请码</th>
                <th>备注</th>
                <th>状态</th>
                <th>机构/企业名称</th>
                <th className="a-table__col-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="a-empty">暂无邀请码记录</div>
                  </td>
                </tr>
              ) : (
                filtered.map((row, index) => (
                  <tr key={row.id}>
                    <td>{index + 1}</td>
                    <td>
                      <code style={{ fontFamily: "var(--font-mono)" }}>{row.code}</code>
                    </td>
                    <td>{row.remark || "—"}</td>
                    <td>
                      <span
                        className={`a-tag${
                          row.status === "unused" ? " a-tag--ok" : " a-tag--muted"
                        }`}
                      >
                        {INVITE_CODE_STATUS_LABEL[row.status]}
                      </span>
                    </td>
                    <td>{row.status === "used" ? (row.companyName ?? "—") : "—"}</td>
                    <td>
                      {row.status === "unused" ? (
                        <div className="a-actions a-actions--nowrap">
                          <TableAction icon={<IconEdit />} onClick={() => openEdit(row)}>
                            编辑
                          </TableAction>
                          <TableAction
                            icon={<IconTrash />}
                            danger
                            onClick={() => setConfirmDelete(row)}
                          >
                            删除
                          </TableAction>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {dialog ? (
        <div className="a-modal-backdrop" role="presentation" onClick={() => setDialog(null)}>
          <div
            className="a-modal a-modal--md"
            role="dialog"
            aria-modal
            onClick={(e) => e.stopPropagation()}
          >
            <div className="a-modal__head">
              <h3 className="a-modal__title">
                {dialog === "create" ? "新增邀请码" : "编辑邀请码"}
              </h3>
              <button
                type="button"
                className="a-modal__close"
                aria-label="关闭"
                onClick={() => setDialog(null)}
              >
                ×
              </button>
            </div>
            <div className="a-form a-form--modal a-form--stack">
              <div className="a-field a-field--stack">
                <span className="a-field__label">邀请码</span>
                <div className="a-inline-actions" style={{ width: "100%" }}>
                  <input
                    className="a-input"
                    style={{ flex: 1, minWidth: 0 }}
                    value={form.code}
                    maxLength={10}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""),
                      }))
                    }
                  />
                  <button
                    type="button"
                    className="a-btn"
                    onClick={() =>
                      setForm((p) => ({ ...p, code: generateInviteCode() }))
                    }
                  >
                    自动生成
                  </button>
                </div>
                <span className="a-field__hint">邀请码为10位，由大写字母和数字组成</span>
              </div>
              <div className="a-field a-field--stack">
                <span className="a-field__label">备注</span>
                <input
                  className="a-input"
                  value={form.remark}
                  maxLength={30}
                  onChange={(e) => setForm((p) => ({ ...p, remark: e.target.value }))}
                />
                <span className="a-field__hint">最多可输入30字描述</span>
              </div>
            </div>
            {error ? <div className="a-form-error">{error}</div> : null}
            <div className="a-modal__actions">
              <button type="button" className="a-btn" onClick={() => setDialog(null)}>
                取消
              </button>
              <button type="button" className="a-btn a-btn--primary" onClick={submit}>
                确定
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="确认删除邀请码"
        description={
          confirmDelete ? `确定删除邀请码「${confirmDelete.code}」吗？删除后不可恢复。` : ""
        }
        confirmText="删除"
        danger
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (!confirmDelete) return;
          const err = store.deleteInviteCode(confirmDelete.id);
          setConfirmDelete(null);
          if (err) window.alert(err);
        }}
      />
    </>
  );
}
