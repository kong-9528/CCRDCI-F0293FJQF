import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  useConsoleHelpStore,
  type ConsoleHelpArticle,
} from "@/lib/consoleHelpStore";
import { VISIBILITY_LABEL, type Visibility } from "@/lib/contentStore";

type Filters = { keyword: string; status: string };

const EMPTY_FILTERS: Filters = { keyword: "", status: "" };

const LIST_PATH = "/content/console-help";

export function ConsoleHelpManagePage() {
  const navigate = useNavigate();
  const store = useConsoleHelpStore();
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS);
  const [confirmDelete, setConfirmDelete] = useState<ConsoleHelpArticle | null>(null);
  const [confirmVis, setConfirmVis] = useState<ConsoleHelpArticle | null>(null);

  const rows = useMemo(() => {
    const kw = applied.keyword.trim().toLowerCase();
    return store.sortedArticles.filter((a) => {
      if (applied.status && a.status !== applied.status) return false;
      if (!kw) return true;
      return (
        a.title.toLowerCase().includes(kw) ||
        a.summary.toLowerCase().includes(kw) ||
        a.body.toLowerCase().includes(kw)
      );
    });
  }, [store.sortedArticles, applied]);

  const visLabel = (status: Visibility) => VISIBILITY_LABEL[status];

  return (
    <>
      <div className="a-card">
        <div className="a-toolbar">
          <div className="a-field">
            <span className="a-field__label">名称</span>
            <input
              className="a-input"
              style={{ minWidth: 200 }}
              placeholder="文章标题或正文"
              value={draft.keyword}
              onChange={(e) => setDraft((p) => ({ ...p, keyword: e.target.value }))}
            />
          </div>
          <div className="a-field">
            <span className="a-field__label">状态</span>
            <select
              className="a-select"
              value={draft.status}
              onChange={(e) => setDraft((p) => ({ ...p, status: e.target.value }))}
            >
              <option value="">全部</option>
              <option value="visible">显示</option>
              <option value="hidden">隐藏</option>
            </select>
          </div>
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
          <button
            type="button"
            className="a-btn a-btn--primary"
            onClick={() => setApplied({ ...draft })}
          >
            查询
          </button>
          <button
            type="button"
            className="a-btn a-btn--primary"
            onClick={() => navigate(`${LIST_PATH}/articles/new`)}
          >
            新增文章
          </button>
        </div>

        <div className="a-card__body a-card__body--flush">
          <table className="a-table">
            <thead>
              <tr>
                <th>标题</th>
                <th>排序权重</th>
                <th>状态</th>
                <th>更新时间</th>
                <th>维护人</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="a-empty">暂无文章</div>
                  </td>
                </tr>
              ) : (
                rows.map((a) => (
                  <tr key={a.id}>
                    <td>{a.title}</td>
                    <td className="num">{a.weight}</td>
                    <td>
                      <span
                        className={`a-tag ${
                          a.status === "visible" ? "a-tag--ok" : "a-tag--muted"
                        }`}
                      >
                        {visLabel(a.status)}
                      </span>
                    </td>
                    <td>{a.updatedAt}</td>
                    <td>{a.maintainer}</td>
                    <td>
                      <div className="a-actions">
                        <button
                          type="button"
                          className="a-btn a-btn--text a-btn--sm"
                          onClick={() => navigate(`${LIST_PATH}/articles/${a.id}/edit`)}
                        >
                          编辑
                        </button>
                        <button
                          type="button"
                          className="a-btn a-btn--text a-btn--sm"
                          onClick={() => setConfirmVis(a)}
                        >
                          {a.status === "visible" ? "隐藏" : "显示"}
                        </button>
                        <button
                          type="button"
                          className="a-btn a-btn--text a-btn--sm"
                          onClick={() => setConfirmDelete(a)}
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="确认删除文章"
        description={
          confirmDelete
            ? `删除后后台列表不再展示，控制台帮助中心亦不可访问（软删除）。确定删除「${confirmDelete.title}」吗？`
            : ""
        }
        confirmText="删除"
        danger
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (!confirmDelete) return;
          store.softDeleteArticle(confirmDelete.id);
          setConfirmDelete(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(confirmVis)}
        title={confirmVis?.status === "visible" ? "确认隐藏文章" : "确认显示文章"}
        description={
          confirmVis
            ? confirmVis.status === "visible"
              ? `隐藏后控制台帮助中心将不再展示「${confirmVis.title}」，确定继续吗？`
              : `显示后「${confirmVis.title}」将对控制台用户可见，确定继续吗？`
            : ""
        }
        confirmText={confirmVis?.status === "visible" ? "隐藏" : "显示"}
        danger={confirmVis?.status === "visible"}
        onCancel={() => setConfirmVis(null)}
        onConfirm={() => {
          if (!confirmVis) return;
          store.setArticleVisibility(
            confirmVis.id,
            confirmVis.status === "visible" ? "hidden" : "visible",
          );
          setConfirmVis(null);
        }}
      />
    </>
  );
}
