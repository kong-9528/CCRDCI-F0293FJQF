import { useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { TableAction } from "@/components/TableAction";
import { IconEdit, IconShield, IconTrash } from "@/components/icons/UiIcons";
import {
  PERMISSION_TREE,
  ROLE_STATUS_LABEL,
  collectDescendantIds,
  togglePermissionNode,
  useRolesStore,
  type PermNode,
  type Role,
} from "@/lib/rolesStore";

type RoleForm = { name: string; description: string };

const EMPTY_FORM: RoleForm = { name: "", description: "" };

function checkboxState(node: PermNode, selected: Set<string>): boolean | "indeterminate" {
  const ids = collectDescendantIds(node);
  const hit = ids.filter((id) => selected.has(id)).length;
  if (hit === 0) return false;
  if (hit === ids.length) return true;
  return "indeterminate";
}

function PermTree({
  nodes,
  selected,
  disabled,
  onChange,
  depth = 0,
}: {
  nodes: PermNode[];
  selected: Set<string>;
  disabled?: boolean;
  onChange: (next: Set<string>) => void;
  depth?: number;
}) {
  return (
    <ul className={`a-perm-tree${depth === 0 ? " a-perm-tree--root" : ""}`}>
      {nodes.map((node) => {
        const state = checkboxState(node, selected);
        return (
          <li key={node.id} className="a-perm-tree__item">
            <label
              className="a-perm-tree__label"
              style={{ paddingLeft: depth * 16 }}
            >
              <input
                type="checkbox"
                className="a-perm-tree__check"
                disabled={disabled}
                checked={state === true}
                ref={(el) => {
                  if (el) el.indeterminate = state === "indeterminate";
                }}
                onChange={() => onChange(togglePermissionNode(node, selected))}
              />
              <span>{node.label}</span>
            </label>
            {node.children?.length ? (
              <PermTree
                nodes={node.children}
                selected={selected}
                disabled={disabled}
                onChange={onChange}
                depth={depth + 1}
              />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

export function RolesPage() {
  const store = useRolesStore();
  const [formDialog, setFormDialog] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<Role | null>(null);
  const [form, setForm] = useState<RoleForm>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  const [permRole, setPermRole] = useState<Role | null>(null);
  const [permSelected, setPermSelected] = useState<Set<string>>(new Set());

  const [confirmDelete, setConfirmDelete] = useState<Role | null>(null);

  const rows = useMemo(() => store.roles, [store.roles]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError(null);
    setFormDialog("create");
  };

  const openEdit = (role: Role) => {
    if (role.builtin) {
      window.alert("超级管理员不可修改");
      return;
    }
    setEditing(role);
    setForm({ name: role.name, description: role.description });
    setError(null);
    setFormDialog("edit");
  };

  const openPerms = (role: Role) => {
    setPermRole(role);
    setPermSelected(new Set(role.permissionIds));
  };

  const submitForm = () => {
    if (!form.name.trim()) {
      setError("请填写角色名称");
      return;
    }
    if (formDialog === "create") {
      store.createRole(form);
      setFormDialog(null);
      return;
    }
    if (editing) {
      const err = store.updateRole(editing.id, form);
      if (err) {
        setError(err);
        return;
      }
      setFormDialog(null);
    }
  };

  const submitPerms = () => {
    if (!permRole) return;
    if (permRole.builtin) {
      setPermRole(null);
      return;
    }
    const err = store.setRolePermissions(permRole.id, Array.from(permSelected));
    if (err) {
      window.alert(err);
      return;
    }
    setPermRole(null);
  };

  return (
    <>
      <div className="a-card">
        <div className="a-toolbar">
          <button type="button" className="a-btn a-btn--primary" onClick={openCreate}>
            新增角色
          </button>
        </div>

        <div className="a-card__body a-card__body--flush">
          <table className="a-table">
            <thead>
              <tr>
                <th>角色名称</th>
                <th>描述</th>
                <th>用户数量</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="a-empty">暂无角色</div>
                  </td>
                </tr>
              ) : (
                rows.map((role) => (
                  <tr key={role.id}>
                    <td>{role.name}</td>
                    <td className="a-cell-clamp a-cell-clamp--wide">{role.description || "—"}</td>
                    <td className="num">{role.userCount}</td>
                    <td>
                      <span
                        className={`a-tag ${
                          role.status === "enabled" ? "a-tag--ok" : "a-tag--muted"
                        }`}
                      >
                        {ROLE_STATUS_LABEL[role.status]}
                      </span>
                    </td>
                    <td>
                      <div className="a-actions">
                        <TableAction
                          icon={<IconEdit />}
                          onClick={() => openEdit(role)}
                          disabled={role.builtin}
                        >
                          编辑
                        </TableAction>
                        <TableAction icon={<IconShield />} onClick={() => openPerms(role)}>
                          权限
                        </TableAction>
                        <TableAction
                          icon={<IconTrash />}
                          danger
                          disabled={role.builtin}
                          onClick={() => {
                            if (role.userCount > 0) {
                              window.alert(
                                `角色「${role.name}」下仍有 ${role.userCount} 个用户，无法删除。请先解除用户绑定。`,
                              );
                              return;
                            }
                            setConfirmDelete(role);
                          }}
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

      {formDialog ? (
        <div
          className="a-modal-backdrop"
          role="presentation"
          onClick={() => setFormDialog(null)}
        >
          <div
            className="a-modal a-modal--md"
            role="dialog"
            aria-modal
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="a-modal__title">
              {formDialog === "create" ? "新增角色" : "编辑角色"}
            </h3>
            {formDialog === "create" ? (
              <p className="a-modal__desc">创建成功后自动为启用状态，权限请在列表中单独配置。</p>
            ) : null}
            <div className="a-form a-form--modal a-form--stack">
              <div className="a-field a-field--stack">
                <span className="a-field__label">
                  角色名称 <span className="a-req">*</span>
                </span>
                <input
                  className="a-input"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="a-field a-field--stack">
                <span className="a-field__label">描述</span>
                <textarea
                  className="a-textarea"
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                />
              </div>
            </div>
            {error ? <div className="a-form-error">{error}</div> : null}
            <div className="a-modal__actions">
              <button type="button" className="a-btn" onClick={() => setFormDialog(null)}>
                取消
              </button>
              <button type="button" className="a-btn a-btn--primary" onClick={submitForm}>
                保存
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {permRole ? (
        <div
          className="a-modal-backdrop"
          role="presentation"
          onClick={() => setPermRole(null)}
        >
          <div
            className="a-modal a-modal--lg"
            role="dialog"
            aria-modal
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="a-modal__title">配置角色权限 — {permRole.name}</h3>
            {permRole.builtin ? (
              <p className="a-modal__desc">
                超级管理员默认拥有全部权限（含后续新增模块），不可修改。
              </p>
            ) : (
              <p className="a-modal__desc">勾选该角色可访问的页面与功能按钮。</p>
            )}
            <div className="a-perm-panel">
              <PermTree
                nodes={PERMISSION_TREE}
                selected={permSelected}
                disabled={permRole.builtin}
                onChange={setPermSelected}
              />
            </div>
            <div className="a-modal__actions">
              <button type="button" className="a-btn" onClick={() => setPermRole(null)}>
                {permRole.builtin ? "关闭" : "取消"}
              </button>
              {!permRole.builtin ? (
                <button type="button" className="a-btn a-btn--primary" onClick={submitPerms}>
                  保存
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="确认删除角色"
        description={
          confirmDelete
            ? `确定删除角色「${confirmDelete.name}」吗？删除后不可恢复。`
            : ""
        }
        confirmText="删除"
        danger
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (!confirmDelete) return;
          const err = store.deleteRole(confirmDelete.id);
          setConfirmDelete(null);
          if (err) window.alert(err);
        }}
      />
    </>
  );
}
