import { useMemo, useState } from "react";
import { ApiDocLink } from "@/components/verify/ApiDocLink";
import {
  INFO_DEFAULT_DAYS,
  INFO_STATUS_LABEL,
  INFO_WORK_TYPE_LABEL,
  MOCK_INFO_RECORDS,
  PAGE_SIZES,
  emptyInfoForm,
  validateInfoForm,
  verifyInfoOnce,
  type InfoVerifyInput,
  type InfoVerifyResult,
  type InfoWorkType,
} from "@/lib/verifyInfo";

function defaultDateRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - INFO_DEFAULT_DAYS);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { from: fmt(from), to: fmt(to) };
}

const WORK_CATEGORIES = ["音乐", "美术", "文字", "视频"];

export function InfoVerifyPage() {
  const range0 = defaultDateRange();
  const [workType, setWorkType] = useState<InfoWorkType>("software");
  const [form, setForm] = useState<InfoVerifyInput>(() => emptyInfoForm("software"));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [latest, setLatest] = useState<InfoVerifyResult | null>(null);
  const [records, setRecords] = useState<InfoVerifyResult[]>(() => [...MOCK_INFO_RECORDS]);
  const [from, setFrom] = useState(range0.from);
  const [to, setTo] = useState(range0.to);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(10);

  const onTabChange = (t: InfoWorkType) => {
    setWorkType(t);
    setForm(emptyInfoForm(t));
    setLatest(null);
    setError(null);
    setPage(1);
  };

  const setField = <K extends keyof InfoVerifyInput>(key: K, value: InfoVerifyInput[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
  };

  const filtered = useMemo(() => {
    return records.filter((r) => {
      if (r.workType !== workType) return false;
      const day = r.verifiedAt.slice(0, 10);
      if (from && day < from) return false;
      if (to && day > to) return false;
      return true;
    });
  }, [records, workType, from, to]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const runVerify = async () => {
    const err = validateInfoForm(workType, form);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await verifyInfoOnce(workType, form);
      setLatest(result);
      setRecords([...MOCK_INFO_RECORDS]);
      setPage(1);
    } finally {
      setLoading(false);
    }
  };

  const nameLabel =
    workType === "software" ? "软件名称" : workType === "work" ? "作品名称" : "数据集名称";

  return (
    <div className="a-stack c-verify-page">
      <div className="a-card">
        <div className="a-tabs" role="tablist">
          {(Object.keys(INFO_WORK_TYPE_LABEL) as InfoWorkType[]).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              className={`a-tabs__item${workType === t ? " is-active" : ""}`}
              onClick={() => onTabChange(t)}
            >
              {INFO_WORK_TYPE_LABEL[t]}
            </button>
          ))}
        </div>

        <div className="a-card__body a-stack">
          <div className="c-verify-panel-head">
            <h2 className="c-verify-panel-head__title">
              版权信息核验 · {INFO_WORK_TYPE_LABEL[workType]}
            </h2>
            <ApiDocLink productId="info" />
          </div>

          <div className="c-verify-form-row">
            <input
              className="a-input"
              placeholder="登记号"
              value={form.regNo}
              onChange={(e) => setField("regNo", e.target.value)}
            />
            <input
              className="a-input"
              placeholder={nameLabel}
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
            />
            <input
              className="a-input"
              placeholder="著作权人"
              value={form.owner}
              onChange={(e) => setField("owner", e.target.value)}
            />
            {workType === "software" ? (
              <input
                className="a-input"
                placeholder="版本号（选填）"
                value={form.version ?? ""}
                onChange={(e) => setField("version", e.target.value)}
              />
            ) : null}
            {workType === "work" ? (
              <select
                className="a-select"
                value={form.workCategory ?? ""}
                onChange={(e) => setField("workCategory", e.target.value)}
              >
                <option value="">作品类型（选填）</option>
                {WORK_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            ) : null}
            <button
              type="button"
              className="a-btn a-btn--primary"
              disabled={loading}
              onClick={() => void runVerify()}
            >
              {loading ? "核验中…" : "核验"}
            </button>
          </div>

          <p className="a-field__hint">
            演示匹配：登记号 2024SR001234 / 2024ZP001234 / 2024SJ001234 且名称、著作权人一致
          </p>

          {error ? <div className="a-field__error">{error}</div> : null}

          {latest ? (
            <div
              className={`a-result${latest.status === "match" ? " a-result--ok" : " a-result--er"}`}
            >
              <div className="a-result__head">
                <span
                  className={`a-dot ${latest.status === "match" ? "a-dot--ok" : "a-dot--er"}`}
                />
                <span className="a-result__title">
                  {latest.status === "match" ? "信息匹配" : "未匹配"}
                </span>
                <span
                  className={`a-tag ${latest.status === "match" ? "a-tag--ok" : "a-tag--er"}`}
                >
                  {INFO_STATUS_LABEL[latest.status]}
                </span>
              </div>
              {latest.message ? <p className="c-verify-hint">{latest.message}</p> : null}
              <div className="a-desc">
                <div className="a-desc__item">
                  <span className="a-desc__label">登记号</span>
                  <span className="a-desc__value">{latest.regNo}</span>
                </div>
                <div className="a-desc__item">
                  <span className="a-desc__label">{nameLabel}</span>
                  <span className="a-desc__value">{latest.name}</span>
                </div>
                <div className="a-desc__item">
                  <span className="a-desc__label">著作权人</span>
                  <span className="a-desc__value">{latest.owner}</span>
                </div>
                {latest.version ? (
                  <div className="a-desc__item">
                    <span className="a-desc__label">版本号</span>
                    <span className="a-desc__value">{latest.version}</span>
                  </div>
                ) : null}
                {latest.workCategory ? (
                  <div className="a-desc__item">
                    <span className="a-desc__label">作品类型</span>
                    <span className="a-desc__value">{latest.workCategory}</span>
                  </div>
                ) : null}
                <div className="a-desc__item">
                  <span className="a-desc__label">核验时间</span>
                  <span className="a-desc__value">{latest.verifiedAt}</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="a-card">
        <div className="a-card__head">
          核验记录
          <div className="a-card__extra a-inline-actions">
            <input type="date" className="a-input" value={from} onChange={(e) => setFrom(e.target.value)} />
            <span className="a-field__hint">至</span>
            <input type="date" className="a-input" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
        <div className="a-card__body a-card__body--flush">
          <div className="a-table-wrap">
            <table className="a-table">
              <thead>
                <tr>
                  <th>核验时间</th>
                  <th>登记号</th>
                  <th>名称</th>
                  <th>著作权人</th>
                  <th>结果</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="a-empty">暂无核验记录</div>
                    </td>
                  </tr>
                ) : (
                  pageRows.map((r) => (
                    <tr key={r.id}>
                      <td>{r.verifiedAt}</td>
                      <td>{r.regNo}</td>
                      <td>{r.name}</td>
                      <td>{r.owner}</td>
                      <td>
                        <span
                          className={`a-tag ${r.status === "match" ? "a-tag--ok" : "a-tag--er"}`}
                        >
                          {INFO_STATUS_LABEL[r.status]}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="a-btn a-btn--text a-btn--sm"
                          onClick={() => {
                            setLatest(r);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                        >
                          详情
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="a-pagination">
            <span>
              共 {filtered.length} 条 · 第 {safePage}/{totalPages} 页
            </span>
            <button type="button" disabled={safePage <= 1} onClick={() => setPage((p) => p - 1)}>
              上一页
            </button>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              下一页
            </button>
            <select
              className="a-select a-input--sm"
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
          </div>
        </div>
      </div>
    </div>
  );
}
