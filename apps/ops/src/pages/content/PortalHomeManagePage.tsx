import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { TableAction } from "@/components/TableAction";
import { IconEdit, IconPublish, IconWithdraw } from "@/components/icons/UiIcons";
import {
  PORTAL_HOME_STATUS_LABEL,
  activeRegionTexts,
  usePortalHomeStore,
  type PortalHomeItem,
  type PortalHomeStatus,
} from "@/lib/portalHomeStore";

type Filters = {
  module: string;
  columnKey: string;
  status: string;
};

const EMPTY_FILTERS: Filters = { module: "", columnKey: "", status: "" };
const PAGE_SIZES = [10, 20, 50] as const;

function statusTagClass(status: PortalHomeStatus) {
  if (status === "published") return "a-tag--ok";
  if (status === "draft") return "a-tag--wn";
  return "a-tag--er";
}

function previewText(text: string) {
  const flat = text.replace(/\s+/g, " ").trim();
  if (!flat) return "—";
  return flat.length > 24 ? `${flat.slice(0, 24)}…` : flat;
}

export function PortalHomeManagePage() {
  const navigate = useNavigate();
  const store = usePortalHomeStore();
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(10);
  const [jump, setJump] = useState("");
  const [confirmPublish, setConfirmPublish] = useState<PortalHomeItem | null>(null);
  const [confirmWithdraw, setConfirmWithdraw] = useState<PortalHomeItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const filtered = useMemo(() => {
    return store.items
      .filter((row) => {
        if (applied.module && row.module !== applied.module) return false;
        if (applied.columnKey && row.columnKey !== applied.columnKey) return false;
        if (applied.status && row.status !== applied.status) return false;
        return true;
      })
      .sort((a, b) => a.id - b.id);
  }, [store.items, applied]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const from = filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, filtered.length);

  const goPage = (n: number) => {
    const next = Math.min(Math.max(1, n), totalPages);
    setPage(next);
  };

  return (
    <>
      <div className="a-card">
        <div className="a-toolbar">
          <div className="a-field">
            <span className="a-field__label">模块</span>
            <select
              className="a-select"
              value={draft.module}
              onChange={(e) => setDraft((p) => ({ ...p, module: e.target.value }))}
            >
              <option value="">全部</option>
              <option value="home">首页</option>
              <option value="faq">FAQ</option>
            </select>
          </div>
          <div className="a-field">
            <span className="a-field__label">栏目</span>
            <select
              className="a-select"
              value={draft.columnKey}
              onChange={(e) => setDraft((p) => ({ ...p, columnKey: e.target.value }))}
            >
              <option value="">全部</option>
              {store.columns.map((col) => (
                <option key={col.key} value={col.key}>
                  {col.label}
                </option>
              ))}
            </select>
          </div>
          <div className="a-field">
            <span className="a-field__label">状态</span>
            <select
              className="a-select"
              value={draft.status}
              onChange={(e) => setDraft((p) => ({ ...p, status: e.target.value }))}
            >
              <option value="">全部</option>
              <option value="published">已发布</option>
              <option value="draft">草稿</option>
              <option value="withdrawn">已撤回</option>
            </select>
          </div>
          <button
            type="button"
            className="a-btn a-btn--primary"
            onClick={() => {
              setApplied({ ...draft });
              setPage(1);
            }}
          >
            搜索
          </button>
          <button
            type="button"
            className="a-btn"
            onClick={() => {
              setDraft(EMPTY_FILTERS);
              setApplied(EMPTY_FILTERS);
              setPage(1);
            }}
          >
            重置
          </button>
        </div>

        <div className="a-card__body a-card__body--flush">
          <table className="a-table" style={{ tableLayout: "fixed", width: "100%" }}>
            <colgroup>
              <col style={{ width: 56 }} />
              <col style={{ width: 72 }} />
              <col style={{ width: 200 }} />
              <col />
              <col />
              <col />
              <col />
              <col />
              <col style={{ width: 88 }} />
              <col style={{ width: 120 }} />
            </colgroup>
            <thead>
              <tr>
                <th>序号</th>
                <th>模块</th>
                <th>栏目</th>
                <th>区域1</th>
                <th>区域2</th>
                <th>区域3</th>
                <th>区域4</th>
                <th>区域5</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={10}>
                    <div className="a-empty">暂无配置项</div>
                  </td>
                </tr>
              ) : (
                pageRows.map((row) => (
                  <tr key={row.id}>
                    <td className="num">{row.id}</td>
                    <td>{row.moduleLabel}</td>
                    <td>
                      <div className="a-cell-clamp" style={{ maxWidth: "100%" }} title={row.columnLabel}>
                        {row.columnLabel}
                      </div>
                    </td>
                    {[0, 1, 2, 3, 4].map((i) => {
                      const texts = activeRegionTexts(row);
                      return (
                        <td key={i}>
                          <div
                            className="a-cell-clamp"
                            style={{ maxWidth: "100%" }}
                            title={texts[i] || undefined}
                          >
                            {previewText(texts[i] ?? "")}
                          </div>
                        </td>
                      );
                    })}
                    <td>
                      <span className={`a-tag ${statusTagClass(row.status)}`}>
                        {PORTAL_HOME_STATUS_LABEL[row.status]}
                      </span>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <div className="a-actions" style={{ flexWrap: "nowrap" }}>
                        {row.status === "published" ? (
                          <TableAction
                            icon={<IconWithdraw />}
                            onClick={() => setConfirmWithdraw(row)}
                          >
                            撤回
                          </TableAction>
                        ) : (
                          <>
                            <TableAction
                              icon={<IconEdit />}
                              onClick={() => navigate(`/content/home/${row.id}/edit`)}
                            >
                              编辑
                            </TableAction>
                            <TableAction
                              icon={<IconPublish />}
                              onClick={() => setConfirmPublish(row)}
                            >
                              发布
                            </TableAction>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="a-list-footer">
          <div className="a-summary">
            显示第 {from}-{to} 条，共 {filtered.length} 条
          </div>
          <div className="a-pagination">
            <select
              className="a-select"
              style={{ minWidth: 88 }}
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value) as (typeof PAGE_SIZES)[number]);
                setPage(1);
              }}
            >
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n}>
                  {n} 条/页
                </option>
              ))}
            </select>
            <button type="button" disabled={safePage <= 1} onClick={() => goPage(safePage - 1)}>
              上一页
            </button>
            <button type="button" className="is-active" onClick={() => undefined}>
              {safePage}
            </button>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => goPage(safePage + 1)}
            >
              下一页
            </button>
            <label className="a-pagination__jump">
              前往
              <input
                className="a-input a-input--sm"
                value={jump}
                onChange={(e) => setJump(e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && jump) {
                    goPage(Number(jump));
                    setJump("");
                  }
                }}
              />
              页
            </label>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(confirmPublish)}
        title="确认发布"
        description="确定要发布该门户配置内容吗？发布后内容将对外展示。"
        confirmText="确认发布"
        onCancel={() => setConfirmPublish(null)}
        onConfirm={() => {
          if (!confirmPublish) return;
          const res = store.publish(confirmPublish.id);
          setConfirmPublish(null);
          showToast(res.ok ? "发布成功" : res.message);
        }}
      />

      <ConfirmDialog
        open={Boolean(confirmWithdraw)}
        title="确认撤回"
        description="确定要撤回该门户配置内容吗？撤回后内容将不再对外展示。"
        confirmText="确认撤回"
        onCancel={() => setConfirmWithdraw(null)}
        onConfirm={() => {
          if (!confirmWithdraw) return;
          const res = store.withdraw(confirmWithdraw.id);
          setConfirmWithdraw(null);
          showToast(res.ok ? "撤回成功" : res.message);
        }}
      />

      {toast ? <div className="a-toast">{toast}</div> : null}
    </>
  );
}
