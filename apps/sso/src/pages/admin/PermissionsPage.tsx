import { useMemo, useState } from "react";
import { ListPageHeader } from "@/components/ListPageHeader";
import { SsoPagination } from "@/components/SsoPagination";
import { RequirePerm } from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth";
import {
  createPermission,
  getApi,
  getSubsystem,
  listApis,
  listPermissions,
  listSubsystems,
  updatePermission,
  type Permission,
} from "@/lib/rbacStore";
import { useClientPagination } from "@/lib/useClientPagination";
import { useRbacTick } from "@/lib/useRbacTick";

export function PermissionsPage() {
  return (
    <RequirePerm code="sso.perms">
      <PermissionsPageInner />
    </RequirePerm>
  );
}

function PermissionsPageInner() {
  useRbacTick();
  const { can } = useAuth();
  const [filterSys, setFilterSys] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Permission | null>(null);
  const perms = useMemo(() => listPermissions(filterSys || undefined), [filterSys]);
  const pager = useClientPagination(perms);

  return (
    <div className="sso-admin">
      <ListPageHeader
        title="权限目录"
        description="权限点按子系统划分；可为每个编码勾选该子系统下的 API 接口（可多选）。"
        actions={
          can("sso.perms.write") ? (
            <button type="button" className="sso-btn sso-btn--primary" onClick={() => setCreating(true)}>
              新增权限点
            </button>
          ) : null
        }
      />

      <div className="sso-toolbar">
        <select
          className="sso-select"
          value={filterSys}
          onChange={(e) => {
            setFilterSys(e.target.value);
            pager.resetPage();
          }}
        >
          <option value="">全部子系统</option>
          {listSubsystems(true).map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="sso-card sso-card--flush">
        <table className="sso-table">
          <thead>
            <tr>
              <th>编码</th>
              <th>名称</th>
              <th>所属系统</th>
              <th>关联接口</th>
              <th>说明</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {pager.pageItems.map((p) => (
              <tr key={p.id}>
                <td>
                  <code>{p.code}</code>
                </td>
                <td>{p.name}</td>
                <td>{getSubsystem(p.subsystemId)?.name ?? "—"}</td>
                <td>
                  {p.apiIds.length ? (
                    <span className="sso-api-chips" title={apiTitles(p.apiIds)}>
                      {p.apiIds.length} 个
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td>{p.description}</td>
                <td>
                  {can("sso.perms.write") ? (
                    <button type="button" className="sso-text-link" onClick={() => setEditing(p)}>
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
                  <div className="sso-empty">暂无权限点</div>
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

      {creating ? <PermDialog mode="create" onClose={() => setCreating(false)} /> : null}
      {editing ? (
        <PermDialog mode="edit" permission={editing} onClose={() => setEditing(null)} />
      ) : null}
    </div>
  );
}

function apiTitles(ids: string[]) {
  return ids
    .map((id) => {
      const a = getApi(id);
      return a ? `${a.method} ${a.path}` : id;
    })
    .join("\n");
}

function PermDialog({
  mode,
  permission,
  onClose,
}: {
  mode: "create" | "edit";
  permission?: Permission;
  onClose: () => void;
}) {
  const [code, setCode] = useState(permission?.code ?? "");
  const [name, setName] = useState(permission?.name ?? "");
  const [subsystemId, setSubsystemId] = useState(permission?.subsystemId ?? "sso");
  const [description, setDescription] = useState(permission?.description ?? "");
  const [apiIds, setApiIds] = useState<string[]>(permission?.apiIds ?? []);
  const [apiKeyword, setApiKeyword] = useState("");
  const [error, setError] = useState("");

  const apis = useMemo(() => listApis(subsystemId), [subsystemId]);
  const filteredApis = useMemo(() => {
    const q = apiKeyword.trim().toLowerCase();
    if (!q) return apis;
    return apis.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.path.toLowerCase().includes(q),
    );
  }, [apis, apiKeyword]);

  const toggleApi = (id: string) => {
    setApiIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const submit = () => {
    if (mode === "create") {
      const result = createPermission({ code, name, subsystemId, description, apiIds });
      if (!result.ok) {
        setError(result.message);
        return;
      }
    } else if (permission) {
      const result = updatePermission(permission.id, { name, description, apiIds });
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
        className="sso-modal sso-modal--xl"
        role="dialog"
        aria-modal
        onClick={(e) => e.stopPropagation()}
      >
        <h3>{mode === "create" ? "新增权限点" : "编辑权限点"}</h3>
        <div className="sso-form">
          {mode === "create" ? (
            <>
              <div className="sso-field">
                <label>所属子系统</label>
                <select
                  className="sso-select"
                  value={subsystemId}
                  onChange={(e) => {
                    setSubsystemId(e.target.value);
                    setApiIds([]);
                    setApiKeyword("");
                  }}
                >
                  {listSubsystems(true).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sso-field">
                <label>编码</label>
                <input
                  className="sso-input"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="如 oa.report"
                />
              </div>
            </>
          ) : (
            <div className="sso-hint">
              所属系统：{getSubsystem(subsystemId)?.name} · 编码：<code>{code}</code>
            </div>
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
          <div className="sso-field">
            <label>
              关联接口（本子系统 · 已选 {apiIds.length}
              {apiKeyword.trim() ? ` · 筛选 ${filteredApis.length}/${apis.length}` : ""}）
            </label>
            <input
              className="sso-input sso-filter-input"
              value={apiKeyword}
              onChange={(e) => setApiKeyword(e.target.value)}
              placeholder="输入关键词，按接口名称 / 路径模糊筛选"
            />
            <div className="sso-check-grid sso-check-grid--compact sso-api-pick">
              {filteredApis.map((a) => (
                <label key={a.id} className="sso-check">
                  <input
                    type="checkbox"
                    checked={apiIds.includes(a.id)}
                    onChange={() => toggleApi(a.id)}
                  />
                  <span>
                    <strong>
                      <span className={`sso-method sso-method--${a.method.toLowerCase()}`}>
                        {a.method}
                      </span>{" "}
                      {a.name}
                    </strong>
                    <small>{a.path}</small>
                  </span>
                </label>
              ))}
              {!apis.length ? (
                <div className="sso-hint">该子系统暂无接口，请先在「接口管理」中维护。</div>
              ) : !filteredApis.length ? (
                <div className="sso-hint">无匹配接口，请调整关键词。</div>
              ) : null}
            </div>
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
