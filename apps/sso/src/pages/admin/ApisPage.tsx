import { useMemo, useState } from "react";
import { ListPageHeader } from "@/components/ListPageHeader";
import { SsoPagination } from "@/components/SsoPagination";
import { RequirePerm } from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth";
import {
  createApi,
  getPermissionIdsForApi,
  getSubsystem,
  listApis,
  listPermissions,
  listSubsystems,
  updateApi,
  type ApiEndpoint,
  type EntityStatus,
  type HttpMethod,
} from "@/lib/rbacStore";
import { useClientPagination } from "@/lib/useClientPagination";
import { useRbacTick } from "@/lib/useRbacTick";

const METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

export function ApisPage() {
  return (
    <RequirePerm code="sso.apis">
      <ApisPageInner />
    </RequirePerm>
  );
}

function ApisPageInner() {
  useRbacTick();
  const { can } = useAuth();
  const [draft, setDraft] = useState({
    keyword: "",
    subsystemId: "",
    status: "" as "" | EntityStatus,
  });
  const [applied, setApplied] = useState(draft);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ApiEndpoint | null>(null);

  const apis = useMemo(() => {
    const q = applied.keyword.trim().toLowerCase();
    return listApis(applied.subsystemId || undefined).filter((a) => {
      if (applied.status && a.status !== applied.status) return false;
      if (!q) return true;
      return (
        a.code.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.path.toLowerCase().includes(q) ||
        a.method.toLowerCase().includes(q)
      );
    });
  }, [applied]);
  const pager = useClientPagination(apis);

  return (
    <div className="sso-admin">
      <ListPageHeader
        title="接口管理"
        description="维护各子系统 API 清单，并可关联菜单管理中的权限点。"
        actions={
          can("sso.apis.write") ? (
            <button type="button" className="sso-btn sso-btn--primary" onClick={() => setCreating(true)}>
              新增接口
            </button>
          ) : null
        }
      />

      <div className="sso-filters">
        <label className="sso-filters__item">
          <span>关键词</span>
          <input
            className="sso-input"
            value={draft.keyword}
            onChange={(e) => setDraft((p) => ({ ...p, keyword: e.target.value }))}
            placeholder="路径 / 编码 / 名称"
          />
        </label>
        <label className="sso-filters__item">
          <span>所属系统</span>
          <select
            className="sso-select"
            value={draft.subsystemId}
            onChange={(e) => setDraft((p) => ({ ...p, subsystemId: e.target.value }))}
          >
            <option value="">全部子系统</option>
            {listSubsystems(true).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="sso-filters__item">
          <span>状态</span>
          <select
            className="sso-select"
            value={draft.status}
            onChange={(e) => setDraft((p) => ({ ...p, status: e.target.value as "" | EntityStatus }))}
          >
            <option value="">全部</option>
            <option value="active">启用</option>
            <option value="disabled">停用</option>
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
              const empty = { keyword: "", subsystemId: "", status: "" as const };
              setDraft(empty);
              setApplied(empty);
              pager.resetPage();
            }}
          >
            重置
          </button>
        </div>
      </div>

      <div className="sso-card sso-card--flush">
        <table className="sso-table">
          <thead>
            <tr>
              <th>方法</th>
              <th>路径</th>
              <th>编码</th>
              <th>名称</th>
              <th>子系统</th>
              <th>关联权限</th>
              <th>鉴权</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {pager.pageItems.map((a) => {
              const linked = getPermissionIdsForApi(a.id).length;
              return (
                <tr key={a.id}>
                  <td>
                    <span className={`sso-method sso-method--${a.method.toLowerCase()}`}>{a.method}</span>
                  </td>
                  <td>
                    <code>{a.path}</code>
                  </td>
                  <td>
                    <code>{a.code}</code>
                  </td>
                  <td>{a.name}</td>
                  <td>{getSubsystem(a.subsystemId)?.name ?? "—"}</td>
                  <td>{linked ? `${linked} 个` : "—"}</td>
                  <td>{a.authRequired ? "是" : "否"}</td>
                  <td>
                    <span className={`sso-tag${a.status === "active" ? " is-ok" : ""}`}>
                      {a.status === "active" ? "启用" : "停用"}
                    </span>
                  </td>
                  <td>
                    {can("sso.apis.write") ? (
                      <button type="button" className="sso-text-link" onClick={() => setEditing(a)}>
                        编辑
                      </button>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              );
            })}
            {!pager.total ? (
              <tr>
                <td colSpan={9}>
                  <div className="sso-empty">暂无接口</div>
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

      {creating ? <ApiDialog mode="create" onClose={() => setCreating(false)} /> : null}
      {editing ? <ApiDialog mode="edit" api={editing} onClose={() => setEditing(null)} /> : null}
    </div>
  );
}

function ApiDialog({
  mode,
  api,
  onClose,
}: {
  mode: "create" | "edit";
  api?: ApiEndpoint;
  onClose: () => void;
}) {
  const [subsystemId, setSubsystemId] = useState(api?.subsystemId ?? "sso");
  const [code, setCode] = useState(api?.code ?? "");
  const [name, setName] = useState(api?.name ?? "");
  const [method, setMethod] = useState<HttpMethod>(api?.method ?? "GET");
  const [path, setPath] = useState(api?.path ?? "/api/v1/");
  const [summary, setSummary] = useState(api?.summary ?? "");
  const [description, setDescription] = useState(api?.description ?? "");
  const [authRequired, setAuthRequired] = useState(api?.authRequired ?? true);
  const [status, setStatus] = useState<EntityStatus>(api?.status ?? "active");
  const [permissionIds, setPermissionIds] = useState<string[]>(() =>
    api ? getPermissionIdsForApi(api.id) : [],
  );
  const [permKeyword, setPermKeyword] = useState("");
  const [error, setError] = useState("");

  const perms = useMemo(() => listPermissions(subsystemId), [subsystemId]);
  const filteredPerms = useMemo(() => {
    const q = permKeyword.trim().toLowerCase();
    if (!q) return perms;
    return perms.filter(
      (p) =>
        p.code.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q),
    );
  }, [perms, permKeyword]);

  const togglePerm = (id: string) => {
    setPermissionIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const submit = () => {
    setError("");
    if (mode === "create") {
      const result = createApi({
        subsystemId,
        code,
        name,
        method,
        path,
        summary,
        description,
        authRequired,
        permissionIds,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
    } else if (api) {
      const result = updateApi(api.id, {
        name,
        method,
        path,
        summary,
        description,
        authRequired,
        status,
        permissionIds,
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
      <div
        className="sso-modal sso-modal--api"
        role="dialog"
        aria-modal
        onClick={(e) => e.stopPropagation()}
      >
        <h3>{mode === "create" ? "新增接口" : "编辑接口"}</h3>

        <div className="sso-api-dialog">
          <section className="sso-api-dialog__basic">
            <h4 className="sso-api-dialog__section-title">基本信息</h4>
            <div className="sso-form sso-form--grid">
              {mode === "create" ? (
                <>
                  <div className="sso-field">
                    <label>所属子系统</label>
                    <select
                      className="sso-select"
                      value={subsystemId}
                      onChange={(e) => {
                        setSubsystemId(e.target.value);
                        setPermissionIds([]);
                        setPermKeyword("");
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
                    <label>接口编码</label>
                    <input
                      className="sso-input"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="如 ops.customers.list"
                    />
                  </div>
                </>
              ) : (
                <div className="sso-hint sso-form--span2">
                  所属系统：{getSubsystem(subsystemId)?.name} · 编码：<code>{code}</code>
                </div>
              )}
              <div className="sso-field">
                <label>名称</label>
                <input className="sso-input" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="sso-field">
                <label>HTTP 方法</label>
                <select
                  className="sso-select"
                  value={method}
                  onChange={(e) => setMethod(e.target.value as HttpMethod)}
                >
                  {METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sso-field sso-form--span2">
                <label>路径</label>
                <input
                  className="sso-input"
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                  placeholder="/api/v1/resource"
                />
              </div>
              <div className="sso-field sso-form--span2">
                <label>摘要</label>
                <input className="sso-input" value={summary} onChange={(e) => setSummary(e.target.value)} />
              </div>
              <div className="sso-field sso-form--span2">
                <label>详细说明</label>
                <textarea
                  className="sso-textarea"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="sso-field">
                <label className="sso-check">
                  <input
                    type="checkbox"
                    checked={authRequired}
                    onChange={(e) => setAuthRequired(e.target.checked)}
                  />
                  <span>需要登录鉴权</span>
                </label>
              </div>
              {mode === "edit" ? (
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
            </div>
          </section>

          <section className="sso-api-dialog__perms">
            <div className="sso-api-dialog__section-head">
              <h4 className="sso-api-dialog__section-title">关联的菜单权限</h4>
              <span className="sso-hint">
                已选 {permissionIds.length}
                {permKeyword.trim()
                  ? ` · 筛选 ${filteredPerms.length}/${perms.length}`
                  : ` / ${perms.length}`}
              </span>
            </div>
            <input
              className="sso-input sso-filter-input"
              value={permKeyword}
              onChange={(e) => setPermKeyword(e.target.value)}
              placeholder="输入关键词，按权限编码 / 名称 / 说明模糊筛选"
            />
            {perms.length ? (
              filteredPerms.length ? (
                <div className="sso-perm-pick">
                  <div className="sso-perm-pick__head" aria-hidden>
                    <span className="sso-perm-pick__check" />
                    <span className="sso-perm-pick__code">编码</span>
                    <span className="sso-perm-pick__name">名称</span>
                    <span className="sso-perm-pick__desc">说明</span>
                  </div>
                  <div className="sso-perm-pick__body">
                    {filteredPerms.map((p) => {
                      const checked = permissionIds.includes(p.id);
                      return (
                        <label key={p.id} className={`sso-perm-pick__row${checked ? " is-checked" : ""}`}>
                          <span className="sso-perm-pick__check">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => togglePerm(p.id)}
                            />
                          </span>
                          <span className="sso-perm-pick__code" title={p.code}>
                            <code>{p.code}</code>
                          </span>
                          <span className="sso-perm-pick__name" title={p.name}>
                            {p.name}
                          </span>
                          <span className="sso-perm-pick__desc" title={p.description || undefined}>
                            {p.description || "—"}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="sso-hint">无匹配权限点，请调整关键词。</div>
              )
            ) : (
              <div className="sso-hint">该子系统暂无权限点，请先在「菜单管理」中维护。</div>
            )}
          </section>

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
