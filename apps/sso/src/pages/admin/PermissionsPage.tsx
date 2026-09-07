import { useEffect, useMemo, useState } from "react";
import { ListPageHeader } from "@/components/ListPageHeader";
import { RequirePerm } from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth";
import {
  MENU_TYPE_LABEL,
  buildPermissionTree,
  createPermission,
  deletePermission,
  getApi,
  getPermission,
  getSubsystem,
  listApis,
  listPermissions,
  listSubsystems,
  updatePermission,
  type MenuType,
  type Permission,
  type PermissionTreeNode,
} from "@/lib/rbacStore";
import { useRbacTick } from "@/lib/useRbacTick";

type FlatMenuRow = {
  node: PermissionTreeNode;
  depth: number;
  hasChildren: boolean;
};

function collectExpandableIds(nodes: PermissionTreeNode[]): string[] {
  const ids: string[] = [];
  const walk = (list: PermissionTreeNode[]) => {
    for (const n of list) {
      if (n.children.length) {
        ids.push(n.id);
        walk(n.children);
      }
    }
  };
  walk(nodes);
  return ids;
}

function flattenVisible(
  nodes: PermissionTreeNode[],
  expanded: Set<string>,
  depth = 0,
): FlatMenuRow[] {
  const rows: FlatMenuRow[] = [];
  for (const node of nodes) {
    const hasChildren = node.children.length > 0;
    rows.push({ node, depth, hasChildren });
    if (hasChildren && expanded.has(node.id)) {
      rows.push(...flattenVisible(node.children, expanded, depth + 1));
    }
  }
  return rows;
}

function filterTree(nodes: PermissionTreeNode[], keyword: string): PermissionTreeNode[] {
  const q = keyword.trim().toLowerCase();
  if (!q) return nodes;
  const walk = (list: PermissionTreeNode[]): PermissionTreeNode[] => {
    const out: PermissionTreeNode[] = [];
    for (const n of list) {
      const children = walk(n.children);
      const hit =
        n.name.toLowerCase().includes(q) ||
        n.code.toLowerCase().includes(q) ||
        n.routePath.toLowerCase().includes(q) ||
        n.component.toLowerCase().includes(q);
      if (hit || children.length) {
        out.push({ ...n, children: hit ? n.children : children });
      }
    }
    return out;
  };
  return walk(nodes);
}

function apiTitles(ids: string[]) {
  return ids
    .map((id) => {
      const a = getApi(id);
      return a ? `${a.method} ${a.path}` : id;
    })
    .join("\n");
}

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
  const canWrite = can("sso.perms.write");

  const [draft, setDraft] = useState({ keyword: "", subsystemId: "sso" });
  const [applied, setApplied] = useState(draft);
  const [expandedOverride, setExpandedOverride] = useState<Set<string> | null>(null);
  const [dialog, setDialog] = useState<
    | { mode: "create"; parentId: string | null }
    | { mode: "edit"; id: string }
    | null
  >(null);

  const tree = useMemo(() => {
    const raw = buildPermissionTree(applied.subsystemId || undefined);
    return filterTree(raw, applied.keyword);
  }, [applied]);

  const expandableIds = collectExpandableIds(tree);
  const expanded = expandedOverride ?? new Set(expandableIds);
  const rows = flattenVisible(tree, expanded);

  const toggle = (id: string) => {
    setExpandedOverride((prev) => {
      const base = prev ?? new Set(expandableIds);
      const next = new Set(base);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onSearch = () => {
    setApplied(draft);
    setExpandedOverride(null);
  };

  const onReset = () => {
    const empty = { keyword: "", subsystemId: "sso" };
    setDraft(empty);
    setApplied(empty);
    setExpandedOverride(null);
  };

  return (
    <div className="sso-admin">
      <ListPageHeader
        title="菜单管理"
        description="经典后台菜单：目录（路由路径）/ 菜单（页面组件）/ 按钮（权限标识）；支持展开收起与关联接口。"
      />

      <div className="sso-filters">
        <label className="sso-filters__item">
          <span>关键字</span>
          <input
            className="sso-input"
            value={draft.keyword}
            onChange={(e) => setDraft((p) => ({ ...p, keyword: e.target.value }))}
            placeholder="菜单名称"
            onKeyDown={(e) => {
              if (e.key === "Enter") onSearch();
            }}
          />
        </label>
        <label className="sso-filters__item">
          <span>所属系统</span>
          <select
            className="sso-select"
            value={draft.subsystemId}
            onChange={(e) => setDraft((p) => ({ ...p, subsystemId: e.target.value }))}
          >
            {listSubsystems(true).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <div className="sso-filters__actions">
          <button type="button" className="sso-btn sso-btn--primary" onClick={onSearch}>
            搜索
          </button>
          <button type="button" className="sso-btn sso-btn--outline" onClick={onReset}>
            重置
          </button>
        </div>
      </div>

      <div className="sso-card sso-card--flush">
        {canWrite ? (
          <div className="sso-menu-toolbar">
            <button
              type="button"
              className="sso-btn sso-btn--primary"
              onClick={() => setDialog({ mode: "create", parentId: null })}
            >
              新增
            </button>
          </div>
        ) : null}

        <table className="sso-table sso-menu-table">
          <thead>
            <tr>
              <th>菜单名称</th>
              <th>类型</th>
              <th>路由路径</th>
              <th>页面组件</th>
              <th>权限标识</th>
              <th>关联接口</th>
              <th>状态</th>
              <th>排序</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ node, depth, hasChildren }) => {
              const open = expanded.has(node.id);
              return (
                <tr key={node.id}>
                  <td>
                    <div className="sso-org-name" style={{ paddingLeft: depth * 20 }}>
                      {hasChildren ? (
                        <button
                          type="button"
                          className={`sso-org-toggle${open ? " is-open" : ""}`}
                          aria-expanded={open}
                          aria-label={open ? "收起" : "展开"}
                          onClick={() => toggle(node.id)}
                        />
                      ) : (
                        <span className="sso-org-toggle sso-org-toggle--leaf" aria-hidden />
                      )}
                      <span className="sso-org-name__text">{node.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`sso-menu-type sso-menu-type--${node.menuType}`}>
                      {MENU_TYPE_LABEL[node.menuType]}
                    </span>
                  </td>
                  <td>
                    {node.routePath ? <code>{node.routePath}</code> : "—"}
                  </td>
                  <td className="sso-cell-ellipsis" title={node.component || undefined}>
                    {node.component || "—"}
                  </td>
                  <td>
                    <code>{node.code}</code>
                  </td>
                  <td>
                    {node.apiIds.length ? (
                      <span className="sso-api-chips" title={apiTitles(node.apiIds)}>
                        {node.apiIds.length} 个
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    <span className={`sso-tag${node.visible ? " is-ok" : ""}`}>
                      {node.visible ? "显示" : "隐藏"}
                    </span>
                  </td>
                  <td>{node.sort}</td>
                  <td>
                    <div className="sso-org-actions">
                      {canWrite && node.menuType !== "button" ? (
                        <button
                          type="button"
                          className="sso-text-link"
                          onClick={() => setDialog({ mode: "create", parentId: node.id })}
                        >
                          新增
                        </button>
                      ) : null}
                      {canWrite ? (
                        <>
                          <button
                            type="button"
                            className="sso-text-link"
                            onClick={() => setDialog({ mode: "edit", id: node.id })}
                          >
                            编辑
                          </button>
                          <button
                            type="button"
                            className="sso-text-link"
                            onClick={() => {
                              if (!window.confirm(`确认删除「${node.name}」及其全部下级？`)) return;
                              deletePermission(node.id);
                            }}
                          >
                            删除
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="sso-text-link"
                          onClick={() => setDialog({ mode: "edit", id: node.id })}
                        >
                          查看
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {!rows.length ? (
              <tr>
                <td colSpan={9}>
                  <div className="sso-empty">暂无菜单</div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {dialog?.mode === "create" ? (
        <MenuDialog
          mode="create"
          parentId={dialog.parentId}
          defaultSubsystemId={applied.subsystemId || "sso"}
          canWrite={canWrite}
          onClose={() => setDialog(null)}
          onCreated={(parentId) => {
            if (parentId) {
              setExpandedOverride((prev) => {
                const next = new Set(prev ?? expandableIds);
                next.add(parentId);
                return next;
              });
            }
          }}
        />
      ) : null}
      {dialog?.mode === "edit" ? (
        (() => {
          const editing = getPermission(dialog.id);
          if (!editing) return null;
          return (
            <MenuDialog
              mode="edit"
              permission={editing}
              canWrite={canWrite}
              onClose={() => setDialog(null)}
            />
          );
        })()
      ) : null}
    </div>
  );
}

const MENU_TYPE_HINT: Record<MenuType, string> = {
  directory: "用于菜单分组，对应路由路径层级",
  menu: "关联系统内部页面，配置路由路径与页面组件",
  button: "用于控制页面按钮或操作权限，配置权限标识",
};

function MenuDialog({
  mode,
  permission,
  parentId,
  defaultSubsystemId,
  canWrite,
  onClose,
  onCreated,
}: {
  mode: "create" | "edit";
  permission?: Permission;
  parentId?: string | null;
  defaultSubsystemId?: string;
  canWrite: boolean;
  onClose: () => void;
  onCreated?: (parentId: string | null) => void;
}) {
  const parent = parentId ? getPermission(parentId) : permission?.parentId ? getPermission(permission.parentId) : null;
  const inferredType: MenuType = parent
    ? parent.menuType === "directory"
      ? "menu"
      : "button"
    : "directory";

  const [subsystemId, setSubsystemId] = useState(
    permission?.subsystemId ?? parent?.subsystemId ?? defaultSubsystemId ?? "sso",
  );
  const [menuType, setMenuType] = useState<MenuType>(permission?.menuType ?? inferredType);
  const [formParentId, setFormParentId] = useState<string>(
    permission?.parentId ?? parentId ?? "",
  );
  const [name, setName] = useState(permission?.name ?? "");
  const [code, setCode] = useState(permission?.code ?? "");
  const [routePath, setRoutePath] = useState(permission?.routePath ?? "");
  const [component, setComponent] = useState(permission?.component ?? "");
  const [sort, setSort] = useState(String(permission?.sort ?? 10));
  const [visible, setVisible] = useState(permission?.visible ?? true);
  const [description, setDescription] = useState(permission?.description ?? "");
  const [apiIds, setApiIds] = useState<string[]>(permission?.apiIds ?? []);
  const [apiKeyword, setApiKeyword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!permission) return;
    setSubsystemId(permission.subsystemId);
    setMenuType(permission.menuType);
    setFormParentId(permission.parentId ?? "");
    setName(permission.name);
    setCode(permission.code);
    setRoutePath(permission.routePath);
    setComponent(permission.component);
    setSort(String(permission.sort));
    setVisible(permission.visible);
    setDescription(permission.description);
    setApiIds(permission.apiIds);
  }, [permission]);

  const parentOptions = useMemo(() => {
    return listPermissions(subsystemId).filter((p) => {
      if (p.menuType === "button") return false;
      if (permission && p.id === permission.id) return false;
      return true;
    });
  }, [subsystemId, permission]);

  const apis = useMemo(() => listApis(subsystemId), [subsystemId]);
  const filteredApis = useMemo(() => {
    const q = apiKeyword.trim().toLowerCase();
    if (!q) return apis;
    return apis.filter(
      (a) => a.name.toLowerCase().includes(q) || a.path.toLowerCase().includes(q),
    );
  }, [apis, apiKeyword]);

  const toggleApi = (id: string) => {
    setApiIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const readOnly = !canWrite;

  const submit = () => {
    if (readOnly) {
      onClose();
      return;
    }
    setError("");
    if (mode === "create") {
      const result = createPermission({
        code,
        name,
        subsystemId,
        description,
        apiIds,
        menuType,
        parentId: formParentId || null,
        routePath,
        component,
        sort: Number(sort) || 0,
        visible,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      onCreated?.(formParentId || null);
    } else if (permission) {
      const result = updatePermission(permission.id, {
        code,
        name,
        description,
        apiIds,
        menuType,
        parentId: formParentId || null,
        routePath,
        component,
        sort: Number(sort) || 0,
        visible,
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
        className="sso-modal sso-modal--xl"
        role="dialog"
        aria-modal
        onClick={(e) => e.stopPropagation()}
      >
        <h3>{mode === "create" ? "新增菜单" : readOnly ? "查看菜单" : "编辑菜单"}</h3>
        <div className="sso-form sso-menu-form">
          {mode === "create" ? (
            <div className="sso-field">
              <label>
                <span className="sso-req">*</span>所属系统
              </label>
              <select
                className="sso-select"
                value={subsystemId}
                disabled={Boolean(parentId) || readOnly}
                onChange={(e) => {
                  setSubsystemId(e.target.value);
                  setFormParentId("");
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
          ) : (
            <div className="sso-hint">
              所属系统：{getSubsystem(subsystemId)?.name}
            </div>
          )}

          <div className="sso-field">
            <label>
              <span className="sso-req">*</span>父级菜单
            </label>
            <select
              className="sso-select"
              value={formParentId}
              disabled={readOnly}
              onChange={(e) => setFormParentId(e.target.value)}
            >
              <option value="">顶级菜单</option>
              {parentOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {MENU_TYPE_LABEL[p.menuType]} · {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sso-field">
            <label>
              <span className="sso-req">*</span>菜单名称
            </label>
            <input
              className="sso-input"
              value={name}
              disabled={readOnly}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入菜单名称"
            />
          </div>

          <div className="sso-field">
            <label>
              <span className="sso-req">*</span>菜单类型
            </label>
            <div className="sso-seg">
              {(["directory", "menu", "button"] as MenuType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`sso-seg__btn${menuType === t ? " is-active" : ""}`}
                  disabled={readOnly}
                  onClick={() => setMenuType(t)}
                >
                  {MENU_TYPE_LABEL[t]}
                </button>
              ))}
            </div>
            <div className="sso-field__hint">{MENU_TYPE_HINT[menuType]}</div>
          </div>

          {menuType === "directory" || menuType === "menu" ? (
            <div className="sso-field">
              <label>
                <span className="sso-req">*</span>路由路径
              </label>
              <input
                className="sso-input"
                value={routePath}
                disabled={readOnly}
                onChange={(e) => setRoutePath(e.target.value)}
                placeholder={menuType === "directory" ? "/system" : "user"}
              />
            </div>
          ) : null}

          {menuType === "menu" ? (
            <div className="sso-field">
              <label>
                <span className="sso-req">*</span>页面组件
              </label>
              <div className="sso-input-affix">
                <span className="sso-input-affix__prefix">src/</span>
                <input
                  className="sso-input"
                  value={component}
                  disabled={readOnly}
                  onChange={(e) => setComponent(e.target.value)}
                  placeholder="pages/admin/UsersPage"
                />
              </div>
            </div>
          ) : null}

          <div className="sso-field">
            <label>
              <span className="sso-req">*</span>
              {menuType === "button" ? "权限标识" : menuType === "menu" ? "页面标识" : "权限标识"}
            </label>
            <input
              className="sso-input"
              value={code}
              disabled={readOnly || mode === "edit"}
              onChange={(e) => setCode(e.target.value)}
              placeholder={menuType === "button" ? "sys:user:create" : "sso.users"}
            />
          </div>

          <div className="sso-field">
            <label>
              <span className="sso-req">*</span>显示状态
            </label>
            <div className="sso-radio-row">
              <label className="sso-radio">
                <input
                  type="radio"
                  name="menu-visible"
                  checked={visible}
                  disabled={readOnly}
                  onChange={() => setVisible(true)}
                />
                显示
              </label>
              <label className="sso-radio">
                <input
                  type="radio"
                  name="menu-visible"
                  checked={!visible}
                  disabled={readOnly}
                  onChange={() => setVisible(false)}
                />
                隐藏
              </label>
            </div>
          </div>

          <div className="sso-field">
            <label>排序</label>
            <input
              className="sso-input"
              type="number"
              value={sort}
              disabled={readOnly}
              onChange={(e) => setSort(e.target.value)}
            />
          </div>

          <div className="sso-field">
            <label>说明</label>
            <input
              className="sso-input"
              value={description}
              disabled={readOnly}
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
              disabled={readOnly}
              onChange={(e) => setApiKeyword(e.target.value)}
              placeholder="输入关键词，按接口名称 / 路径模糊筛选"
            />
            <div className="sso-check-grid sso-check-grid--compact sso-api-pick">
              {filteredApis.map((a) => (
                <label key={a.id} className="sso-check">
                  <input
                    type="checkbox"
                    checked={apiIds.includes(a.id)}
                    disabled={readOnly}
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
            {readOnly ? "关闭" : "取消"}
          </button>
          {!readOnly ? (
            <button type="button" className="sso-btn sso-btn--primary" onClick={submit}>
              保存
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
