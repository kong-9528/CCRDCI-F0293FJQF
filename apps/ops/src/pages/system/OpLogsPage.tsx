import { useMemo, useState } from "react";
import {
  OP_LOG_SCOPE_LABEL,
  actionTypeLabel,
  filterOpLogs,
  useOpLogOptions,
  type OpLogFilters,
  type OpLogScope,
} from "@/lib/opLogsStore";

const EMPTY_FILTERS: OpLogFilters = {
  actionType: "",
  operator: "",
  from: "",
  to: "",
};

export function OpLogsPage() {
  const [scope, setScope] = useState<OpLogScope>("portal");
  const [draft, setDraft] = useState<OpLogFilters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<OpLogFilters>(EMPTY_FILTERS);
  const options = useOpLogOptions(scope);

  const rows = useMemo(() => filterOpLogs(scope, applied), [scope, applied]);

  const switchScope = (next: OpLogScope) => {
    setScope(next);
    setDraft(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
  };

  return (
    <div className="a-card">
      <div className="a-tabs" role="tablist">
        {(Object.keys(OP_LOG_SCOPE_LABEL) as OpLogScope[]).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            className={`a-tabs__item${scope === key ? " is-active" : ""}`}
            onClick={() => switchScope(key)}
          >
            {OP_LOG_SCOPE_LABEL[key]}
          </button>
        ))}
      </div>

      <div className="a-toolbar">
        <div className="a-field">
          <span className="a-field__label">操作类型</span>
          <select
            className="a-select"
            value={draft.actionType}
            onChange={(e) => setDraft((p) => ({ ...p, actionType: e.target.value }))}
          >
            <option value="">全部</option>
            {options.actionTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="a-field">
          <span className="a-field__label">操作人</span>
          <select
            className="a-select"
            value={draft.operator}
            onChange={(e) => setDraft((p) => ({ ...p, operator: e.target.value }))}
          >
            <option value="">全部</option>
            {options.operators.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className="a-field">
          <span className="a-field__label">操作时间</span>
          <div className="a-date-range">
            <input
              type="date"
              className="a-input"
              value={draft.from}
              onChange={(e) => setDraft((p) => ({ ...p, from: e.target.value }))}
            />
            <span>至</span>
            <input
              type="date"
              className="a-input"
              value={draft.to}
              onChange={(e) => setDraft((p) => ({ ...p, to: e.target.value }))}
            />
          </div>
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
      </div>

      <div className="a-card__body a-card__body--flush">
        <table className="a-table">
          <thead>
            <tr>
              <th>操作类型</th>
              <th>操作内容</th>
              <th>操作人</th>
              <th>操作时间</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <div className="a-empty">暂无操作日志</div>
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td>{actionTypeLabel(scope, row.actionType)}</td>
                  <td className="a-cell-clamp a-cell-clamp--wide">{row.content}</td>
                  <td>{row.operator}</td>
                  <td>{row.operatedAt}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
