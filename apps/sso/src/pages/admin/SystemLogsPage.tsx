import { useMemo, useState } from "react";
import { RequirePerm } from "@/components/RequireAuth";
import { SsoPagination } from "@/components/SsoPagination";
import { getSystemLog, listSystemLogs, type SystemLog } from "@/lib/systemLogStore";
import { useClientPagination } from "@/lib/useClientPagination";

type Filters = {
  keyword: string;
  startAt: string;
  endAt: string;
};

const EMPTY: Filters = { keyword: "", startAt: "", endAt: "" };

/** datetime-local → 可与 operatedAt 比较的前缀 */
function toCompareKey(value: string) {
  if (!value) return "";
  // 2026-09-10T15:05 → 2026-09-10T15:05:00
  return value.length === 16 ? `${value}:00` : value;
}

export function SystemLogsPage() {
  return (
    <RequirePerm code="sso.logs">
      <SystemLogsPageInner />
    </RequirePerm>
  );
}

function SystemLogsPageInner() {
  const [draft, setDraft] = useState<Filters>(EMPTY);
  const [applied, setApplied] = useState<Filters>(EMPTY);
  const [detailId, setDetailId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = applied.keyword.trim().toLowerCase();
    const start = toCompareKey(applied.startAt);
    const end = toCompareKey(applied.endAt);

    return listSystemLogs().filter((row) => {
      if (start && row.operatedAt < start) return false;
      if (end && row.operatedAt > end) return false;
      if (!q) return true;
      return (
        row.ip.toLowerCase().includes(q) ||
        row.operator.toLowerCase().includes(q) ||
        row.title.toLowerCase().includes(q)
      );
    });
  }, [applied]);

  const pager = useClientPagination(filtered);
  const detail = detailId ? getSystemLog(detailId) : null;

  return (
    <div className="sso-admin">
      <div className="sso-filters">
        <label className="sso-filters__item">
          <span>关键字</span>
          <input
            className="sso-input"
            value={draft.keyword}
            onChange={(e) => setDraft((p) => ({ ...p, keyword: e.target.value }))}
            placeholder="IP / 操作人 / 操作标题"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setApplied(draft);
                pager.resetPage();
              }
            }}
          />
        </label>
        <label className="sso-filters__item sso-filters__item--range">
          <span>操作时间</span>
          <div className="sso-range">
            <input
              type="datetime-local"
              className="sso-input"
              value={draft.startAt}
              onChange={(e) => setDraft((p) => ({ ...p, startAt: e.target.value }))}
              aria-label="开始时间"
            />
            <span className="sso-range__sep">~</span>
            <input
              type="datetime-local"
              className="sso-input"
              value={draft.endAt}
              onChange={(e) => setDraft((p) => ({ ...p, endAt: e.target.value }))}
              aria-label="截止时间"
            />
          </div>
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
            搜索
          </button>
          <button
            type="button"
            className="sso-btn sso-btn--outline"
            onClick={() => {
              setDraft(EMPTY);
              setApplied(EMPTY);
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
              <th>操作标题</th>
              <th>IP地址</th>
              <th>执行时间(ms)</th>
              <th>操作人</th>
              <th>操作时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {pager.pageItems.map((row) => (
              <tr key={row.id}>
                <td>{row.title}</td>
                <td>
                  <code>{row.ip}</code>
                </td>
                <td>{row.durationMs}</td>
                <td>{row.operator || "—"}</td>
                <td>{row.operatedAt}</td>
                <td>
                  <button
                    type="button"
                    className="sso-text-link"
                    onClick={() => setDetailId(row.id)}
                  >
                    详情
                  </button>
                </td>
              </tr>
            ))}
            {!pager.total ? (
              <tr>
                <td colSpan={6}>
                  <div className="sso-empty">暂无日志</div>
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

      {detail ? <SystemLogDetailDialog log={detail} onClose={() => setDetailId(null)} /> : null}
    </div>
  );
}

function SystemLogDetailDialog({ log, onClose }: { log: SystemLog; onClose: () => void }) {
  return (
    <div className="sso-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="sso-modal sso-modal--lg"
        role="dialog"
        aria-modal
        aria-labelledby="sso-log-detail-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sso-modal__head">
          <h3 id="sso-log-detail-title">日志详情</h3>
          <button type="button" className="sso-modal__close" aria-label="关闭" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="sso-modal__body">
          <table className="sso-log-detail">
            <tbody>
              <tr>
                <th>操作标题</th>
                <td colSpan={3}>{log.title}</td>
              </tr>
              <tr>
                <th>执行时间</th>
                <td>{log.durationMs}ms</td>
                <th>操作人</th>
                <td>{log.operator || "—"}</td>
              </tr>
              <tr>
                <th>操作时间</th>
                <td>{log.operatedAt}</td>
                <th>IP地址</th>
                <td>{log.ip}</td>
              </tr>
              <tr>
                <th>浏览器</th>
                <td>{log.browser}</td>
                <th>操作系统</th>
                <td>{log.os}</td>
              </tr>
              <tr>
                <th>自定义内容</th>
                <td colSpan={3}>{log.content || "无"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
