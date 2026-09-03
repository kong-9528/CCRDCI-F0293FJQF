import { useState } from "react";
import { ListPageHeader } from "@/components/ListPageHeader";
import { SsoPagination } from "@/components/SsoPagination";
import { RequirePerm } from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth";
import {
  SSO_SUBSYSTEM_ID,
  createSubsystem,
  listSubsystems,
  updateSubsystem,
  type EntityStatus,
  type Subsystem,
} from "@/lib/rbacStore";
import { useClientPagination } from "@/lib/useClientPagination";
import { useRbacTick } from "@/lib/useRbacTick";

export function SubsystemsPage() {
  return (
    <RequirePerm code="sso.subsystems">
      <SubsystemsPageInner />
    </RequirePerm>
  );
}

function SubsystemsPageInner() {
  useRbacTick();
  const { can } = useAuth();
  const systems = listSubsystems(true);
  const pager = useClientPagination(systems);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Subsystem | null>(null);

  return (
    <div className="sso-admin">
      <ListPageHeader
        title="子系统管理"
        description="维护可接入的业务系统清单与入口地址。"
        actions={
          can("sso.subsystems.write") ? (
            <button type="button" className="sso-btn sso-btn--primary" onClick={() => setCreating(true)}>
              新增子系统
            </button>
          ) : null
        }
      />

      <div className="sso-card sso-card--flush">
        <table className="sso-table">
          <thead>
            <tr>
              <th>编码</th>
              <th>名称</th>
              <th>入口</th>
              <th>排序</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {pager.pageItems.map((s) => (
              <tr key={s.id}>
                <td>
                  <code>{s.code}</code>
                </td>
                <td>
                  <span className="sso-sys-dot" style={{ background: s.accent }} />
                  {s.name}
                </td>
                <td className="sso-cell-ellipsis">{s.entryUrl || "—（本平台）"}</td>
                <td>{s.sort}</td>
                <td>
                  <span className={`sso-tag${s.status === "active" ? " is-ok" : ""}`}>
                    {s.status === "active" ? "启用" : "停用"}
                  </span>
                </td>
                <td>
                  {can("sso.subsystems.write") ? (
                    <button type="button" className="sso-text-link" onClick={() => setEditing(s)}>
                      编辑
                    </button>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
            {!pager.total ? (
              <tr>
                <td colSpan={6}>
                  <div className="sso-empty">暂无子系统</div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
        <SsoPagination
          page={pager.page}
          pageSize={pager.pageSize}
          total={pager.total}
          totalPages={pager.totalPages}
          pageSizes={pager.pageSizes}
          onPageChange={pager.setPage}
          onPageSizeChange={pager.setPageSize}
        />
      </div>

      {creating ? <SysDialog mode="create" onClose={() => setCreating(false)} /> : null}
      {editing ? (
        <SysDialog mode="edit" system={editing} onClose={() => setEditing(null)} />
      ) : null}
    </div>
  );
}

function SysDialog({
  mode,
  system,
  onClose,
}: {
  mode: "create" | "edit";
  system?: Subsystem;
  onClose: () => void;
}) {
  const isSso = system?.id === SSO_SUBSYSTEM_ID;
  const [code, setCode] = useState(system?.code ?? "");
  const [name, setName] = useState(system?.name ?? "");
  const [description, setDescription] = useState(system?.description ?? "");
  const [entryUrl, setEntryUrl] = useState(system?.entryUrl ?? "");
  const [accent, setAccent] = useState(system?.accent ?? "#0f3786");
  const [sort, setSort] = useState(String(system?.sort ?? 50));
  const [status, setStatus] = useState<EntityStatus>(system?.status ?? "active");
  const [error, setError] = useState("");

  const submit = () => {
    setError("");
    const sortNum = Number(sort);
    if (!Number.isInteger(sortNum)) {
      setError("排序须为整数");
      return;
    }
    if (mode === "create") {
      const result = createSubsystem({
        code,
        name,
        description,
        entryUrl,
        accent,
        sort: sortNum,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
    } else if (system) {
      const result = updateSubsystem(system.id, {
        name,
        description,
        entryUrl,
        accent,
        sort: sortNum,
        status,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
    }
    onClose();
  };

  return (
    <div className="sso-modal-backdrop" role="presentation" onClick={onClose}>
      <div className="sso-modal" role="dialog" aria-modal onClick={(e) => e.stopPropagation()}>
        <h3>{mode === "create" ? "新增子系统" : "编辑子系统"}</h3>
        <div className="sso-form">
          {mode === "create" ? (
            <div className="sso-field">
              <label>编码</label>
              <input className="sso-input" value={code} onChange={(e) => setCode(e.target.value)} />
            </div>
          ) : (
            <div className="sso-hint">编码：{code}</div>
          )}
          <div className="sso-field">
            <label>名称</label>
            <input className="sso-input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="sso-field">
            <label>说明</label>
            <input
              className="sso-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          {!isSso ? (
            <div className="sso-field">
              <label>入口 URL</label>
              <input
                className="sso-input"
                value={entryUrl}
                onChange={(e) => setEntryUrl(e.target.value)}
                placeholder="https://"
              />
            </div>
          ) : null}
          <div className="sso-field">
            <label>主题色</label>
            <input
              className="sso-input"
              value={accent}
              onChange={(e) => setAccent(e.target.value)}
            />
          </div>
          <div className="sso-field">
            <label>排序</label>
            <input className="sso-input" value={sort} onChange={(e) => setSort(e.target.value)} />
          </div>
          {mode === "edit" && !isSso ? (
            <div className="sso-field">
              <label>状态</label>
              <select
                className="sso-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as EntityStatus)}
              >
                <option value="active">启用</option>
                <option value="disabled">停用</option>
              </select>
            </div>
          ) : null}
          {error ? <div className="sso-error">{error}</div> : null}
        </div>
        <div className="sso-form-actions">
          <button type="button" className="sso-btn sso-btn--ghost" onClick={onClose}>
            取消
          </button>
          <button type="button" className="sso-btn sso-btn--primary" onClick={submit}>
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
