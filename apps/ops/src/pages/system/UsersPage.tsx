import { useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useRolesStore } from "@/lib/rolesStore";
import {
  USER_STATUS_LABEL,
  useUsersStore,
  type SysUser,
} from "@/lib/usersStore";

type FormState = {
  loginName: string;
  displayName: string;
  roleId: string;
};

const EMPTY: FormState = { loginName: "", displayName: "", roleId: "" };

export function UsersPage() {
  const store = useUsersStore();
  // 订阅角色变更，保证角色名称与下拉选项及时刷新
  useRolesStore();

  const [dialog, setDialog] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<SysUser | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<SysUser | null>(null);
  const [confirmStatus, setConfirmStatus] = useState<SysUser | null>(null);

  const roleOptions = useMemo(
    () => store.assignableRoles(editing?.roleId),
    [store, editing],
  );

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setError(null);
    setDialog("create");
  };

  const openEdit = (user: SysUser) => {
    if (user.builtin) {
      window.alert("超级管理员不可修改");
      return;
    }
    setEditing(user);
    setForm({
      loginName: user.loginName,
      displayName: user.displayName,
      roleId: user.roleId,
    });
    setError(null);
    setDialog("edit");
  };

  const submit = () => {
    if (dialog === "create") {
      const err = store.createUser(form);
      if (err) {
        setError(err);
        return;
      }
      setDialog(null);
      return;
    }
    if (editing) {
      const err = store.updateUser(editing.id, form);
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
          <button type="button" className="a-btn a-btn--primary" onClick={openCreate}>
            新增用户
          </button>
        </div>

        <div className="a-card__body a-card__body--flush">
          <table className="a-table">
            <thead>
              <tr>
                <th>登录名</th>
                <th>用户名称</th>
                <th>角色</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {store.users.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="a-empty">暂无用户</div>
                  </td>
                </tr>
              ) : (
                store.users.map((user) => {
                  const isSelf = user.id === store.currentUserId;
                  return (
                    <tr key={user.id}>
                      <td>
                        {user.loginName}
                        {isSelf ? (
                          <span className="a-tag a-tag--muted" style={{ marginLeft: 6 }}>
                            当前
                          </span>
                        ) : null}
                      </td>
                      <td>{user.displayName}</td>
                      <td>{store.roleNameOf(user.roleId)}</td>
                      <td>
                        <span
                          className={`a-tag ${
                            user.status === "enabled" ? "a-tag--ok" : "a-tag--muted"
                          }`}
                        >
                          {USER_STATUS_LABEL[user.status]}
                        </span>
                      </td>
                      <td>
                        <div className="a-actions">
                          <button
                            type="button"
                            className="a-btn a-btn--text a-btn--sm"
                            onClick={() => openEdit(user)}
                            disabled={user.builtin}
                          >
                            编辑
                          </button>
                          <button
                            type="button"
                            className="a-btn a-btn--text a-btn--sm"
                            onClick={() => setConfirmStatus(user)}
                            disabled={user.builtin || isSelf}
                          >
                            {user.status === "enabled" ? "停用" : "启用"}
                          </button>
                          <button
                            type="button"
                            className="a-btn a-btn--text a-btn--sm"
                            onClick={() => {
                              if (isSelf) {
                                window.alert("不能删除当前登录账号");
                                return;
                              }
                              if (user.builtin) {
                                window.alert("超级管理员不可删除");
                                return;
                              }
                              setConfirmDelete(user);
                            }}
                            disabled={user.builtin || isSelf}
                          >
                            删除
                          </button>
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

      {dialog ? (
        <div className="a-modal-backdrop" role="presentation" onClick={() => setDialog(null)}>
          <div
            className="a-modal a-modal--md"
            role="dialog"
            aria-modal
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="a-modal__title">
              {dialog === "create" ? "新增用户" : "编辑用户"}
            </h3>
            {dialog === "create" ? (
              <p className="a-modal__desc">
                创建成功后自动为启用状态。可选角色仅包含不超过当前账号权限范围的角色。
              </p>
            ) : null}
            <div className="a-form a-form--modal a-form--stack">
              <div className="a-field a-field--stack">
                <span className="a-field__label">
                  登录名 <span className="a-req">*</span>
                </span>
                <input
                  className="a-input"
                  value={form.loginName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, loginName: e.target.value.trimStart() }))
                  }
                />
              </div>
              <div className="a-field a-field--stack">
                <span className="a-field__label">
                  用户名称 <span className="a-req">*</span>
                </span>
                <input
                  className="a-input"
                  value={form.displayName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, displayName: e.target.value }))
                  }
                />
              </div>
              <div className="a-field a-field--stack">
                <span className="a-field__label">
                  角色 <span className="a-req">*</span>
                </span>
                <select
                  className="a-select"
                  value={form.roleId}
                  onChange={(e) => setForm((p) => ({ ...p, roleId: e.target.value }))}
                >
                  <option value="">请选择角色</option>
                  {roleOptions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {error ? <div className="a-form-error">{error}</div> : null}
            <div className="a-modal__actions">
              <button type="button" className="a-btn" onClick={() => setDialog(null)}>
                取消
              </button>
              <button type="button" className="a-btn a-btn--primary" onClick={submit}>
                保存
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="确认删除用户"
        description={
          confirmDelete
            ? `确定删除用户「${confirmDelete.displayName}」（${confirmDelete.loginName}）吗？`
            : ""
        }
        confirmText="删除"
        danger
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (!confirmDelete) return;
          const err = store.deleteUser(confirmDelete.id);
          setConfirmDelete(null);
          if (err) window.alert(err);
        }}
      />

      <ConfirmDialog
        open={Boolean(confirmStatus)}
        title={confirmStatus?.status === "enabled" ? "确认停用用户" : "确认启用用户"}
        description={
          confirmStatus
            ? confirmStatus.status === "enabled"
              ? `停用后「${confirmStatus.displayName}」将无法登录运营后台，确定继续吗？`
              : `确定启用用户「${confirmStatus.displayName}」吗？`
            : ""
        }
        confirmText={confirmStatus?.status === "enabled" ? "停用" : "启用"}
        danger={confirmStatus?.status === "enabled"}
        onCancel={() => setConfirmStatus(null)}
        onConfirm={() => {
          if (!confirmStatus) return;
          const err = store.setUserStatus(
            confirmStatus.id,
            confirmStatus.status === "enabled" ? "disabled" : "enabled",
          );
          setConfirmStatus(null);
          if (err) window.alert(err);
        }}
      />
    </>
  );
}
