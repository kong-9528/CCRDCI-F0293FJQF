import { useMemo, useState } from "react";
import { SsoPagination } from "@/components/SsoPagination";
import { RequirePerm } from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth";
import {
  createBusinessScope,
  getSubsystem,
  listBusinessScopes,
  listSubsystems,
  updateBusinessScope,
  type BusinessScope,
} from "@/lib/rbacStore";
import { useClientPagination } from "@/lib/useClientPagination";
import { useRbacTick } from "@/lib/useRbacTick";

export function BusinessScopesPage() {
  return (
    <RequirePerm code="sso.bizScopes">
      <BusinessScopesPageInner />
    </RequirePerm>
  );
}

function BusinessScopesPageInner() {
  useRbacTick();
  const { can } = useAuth();
  const [draft, setDraft] = useState({ keyword: "", subsystemId: "" });
  const [applied, setApplied] = useState(draft);
  const [editing, setEditing] = useState<BusinessScope | null>(null);
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    const q = applied.keyword.trim().toLowerCase();
    return listBusinessScopes().filter((b) => {
      if (applied.subsystemId && b.subsystemId !== applied.subsystemId) return false;
      if (!q) return true;
      const sysName = getSubsystem(b.subsystemId)?.name ?? "";
      return (
        b.code.toLowerCase().includes(q) ||
        b.name.toLowerCase().includes(q) ||
        sysName.toLowerCase().includes(q)
      );
    });
  }, [applied]);

  const pager = useClientPagination(filtered);

  return (
    <div className="sso-admin">
      <div className="sso-filters">
        <label className="sso-filters__item">
          <span>关键词</span>
          <input
            className="sso-input"
            value={draft.keyword}
            onChange={(e) => setDraft((p) => ({ ...p, keyword: e.target.value }))}
            placeholder="编码 / 名称"
          />
        </label>
        <label className="sso-filters__item">
          <span>所属子系统</span>
          <select
            className="sso-select"
            value={draft.subsystemId}
            onChange={(e) => setDraft((p) => ({ ...p, subsystemId: e.target.value }))}
          >
            <option value="">全部</option>
            {listSubsystems(true).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <div className="sso-filters__actions">
          <button
            type="button"
            className="sso-btn sso-btn--primary"
            onClick={() => {
              setApplied(draft);
              pager.resetPage();
            }}
          >
            查询
          </button>
          <button
            type="button"
            className="sso-btn sso-btn--outline"
            onClick={() => {
              const empty = { keyword: "", subsystemId: "" };
              setDraft(empty);
              setApplied(empty);
              pager.resetPage();
            }}
          >
            重置
          </button>
        </div>
        {can("sso.bizScopes.write") ? (
          <div className="sso-filters__end">
            <button type="button" className="sso-btn sso-btn--primary" onClick={() => setCreating(true)}>
              新增业务范围
            </button>
          </div>
        ) : null}
      </div>

      <div className="sso-card sso-card--flush">
        <table className="sso-table">
          <thead>
            <tr>
              <th>编码</th>
              <th>业务范围名称</th>
              <th>所属子系统</th>
              <th>业务数</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {pager.pageItems.map((b) => (
              <tr key={b.id}>
                <td>
                  <code>{b.code}</code>
                </td>
                <td>{b.name}</td>
                <td>{getSubsystem(b.subsystemId)?.name ?? "—"}</td>
                <td>{b.businessCount}</td>
                <td>
                  {can("sso.bizScopes.write") ? (
                    <button type="button" className="sso-text-link" onClick={() => setEditing(b)}>
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
                <td colSpan={5}>
                  <div className="sso-empty">暂无业务范围</div>
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

      {creating ? <BusinessScopeDialog mode="create" onClose={() => setCreating(false)} /> : null}
      {editing ? (
        <BusinessScopeDialog
          mode="edit"
          scope={editing}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </div>
  );
}

function BusinessScopeDialog({
  mode,
  scope,
  onClose,
}: {
  mode: "create" | "edit";
  scope?: BusinessScope;
  onClose: () => void;
}) {
  const [subsystemId, setSubsystemId] = useState(scope?.subsystemId ?? "sys-ops");
  const [code, setCode] = useState(scope?.code ?? "");
  const [name, setName] = useState(scope?.name ?? "");
  const [description, setDescription] = useState(scope?.description ?? "");
  const [error, setError] = useState("");

  const submit = () => {
    setError("");
    if (mode === "create") {
      const result = createBusinessScope({ code, name, subsystemId, description });
      if (!result.ok) {
        setError(result.message);
        return;
      }
    } else if (scope) {
      const result = updateBusinessScope(scope.id, { code, name, subsystemId, description });
      if (!result.ok) {
        setError(result.message);
        return;
      }
    }
    onClose();
  };

  return (
    <div className="sso-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="sso-modal"
        role="dialog"
        aria-modal
        onClick={(e) => e.stopPropagation()}
      >
        <h3>{mode === "create" ? "新增业务范围" : "编辑业务范围"}</h3>
        <div className="sso-form">
          <div className="sso-field">
            <label>
              所属子系统 <span className="sso-required">*</span>
            </label>
            <select
              className="sso-select"
              value={subsystemId}
              onChange={(e) => setSubsystemId(e.target.value)}
            >
              {listSubsystems(true).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="sso-field">
            <label>
              编码 <span className="sso-required">*</span>
            </label>
            <input className="sso-input" value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
          <div className="sso-field">
            <label>
              业务范围名称 <span className="sso-required">*</span>
            </label>
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
