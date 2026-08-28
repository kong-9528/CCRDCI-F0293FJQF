import { useMemo, useState } from "react";
import { ProductUsagePanel } from "@/components/ProductUsagePanel";
import { ServiceDisclaimer } from "@/components/ServiceDisclaimer";
import { ApiDocLink } from "@/components/verify/ApiDocLink";
import { InfoDetailDrawer } from "@/components/verify/InfoDetailDrawer";
import {
  INFO_DEFAULT_DAYS,
  INFO_EXPORT_LIMIT,
  INFO_STATUS_LABEL,
  INFO_WORK_TYPE_LABEL,
  MOCK_INFO_RECORDS,
  PAGE_SIZES,
  emptyInfoForm,
  formatInfoMismatchTags,
  infoNameLabel,
  infoSubmittedFieldRows,
  infoVerifyPassed,
  infoVerifyTitle,
  validateInfoForm,
  verifyInfoOnce,
  type InfoVerifyInput,
  type InfoVerifyResult,
  type InfoWorkType,
} from "@/lib/verifyInfo";
import { VERIFY_DETAIL_DRAWER_ENABLED } from "@/lib/verifyFeatureFlags";

function defaultDateRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - INFO_DEFAULT_DAYS);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { from: fmt(from), to: fmt(to) };
}

type Filters = {
  from: string;
  to: string;
  keyword: string;
  channel: string;
};

export function InfoVerifyPage() {
  const range0 = defaultDateRange();
  const [workType, setWorkType] = useState<InfoWorkType>("software");
  const [form, setForm] = useState<InfoVerifyInput>(() => emptyInfoForm("software"));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [latest, setLatest] = useState<InfoVerifyResult | null>(null);
  const [records, setRecords] = useState<InfoVerifyResult[]>(() => [...MOCK_INFO_RECORDS]);
  const [detail, setDetail] = useState<InfoVerifyResult | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [draft, setDraft] = useState<Filters>({
    from: range0.from,
    to: range0.to,
    keyword: "",
    channel: "",
  });
  const [applied, setApplied] = useState<Filters>({ ...draft });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(10);

  const nameLabel = infoNameLabel(workType);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

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
    const kw = applied.keyword.trim().toLowerCase();
    return records.filter((r) => {
      if (r.workType !== workType) return false;
      const day = r.verifiedAt.slice(0, 10);
      if (applied.from && day < applied.from) return false;
      if (applied.to && day > applied.to) return false;
      if (applied.channel && r.channel !== applied.channel) return false;
      if (
        kw &&
        !r.regNo.toLowerCase().includes(kw) &&
        !r.name.toLowerCase().includes(kw) &&
        !r.owner.toLowerCase().includes(kw) &&
        !(r.verifyCode ?? "").toLowerCase().includes(kw)
      ) {
        return false;
      }
      return true;
    });
  }, [records, workType, applied]);

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

  const exportExcel = () => {
    const rows = filtered.slice(0, INFO_EXPORT_LIMIT);
    const header = [
      "核验编码",
      "核验时间",
      "登记号",
      "名称",
      "著作权人",
      "结果",
      "不一致字段",
      "方式",
    ];
    const lines = [
      header.join(","),
      ...rows.map((r) =>
        [
          r.verifyCode,
          r.verifiedAt,
          r.regNo,
          r.name,
          r.owner,
          INFO_STATUS_LABEL[r.status],
          formatInfoMismatchTags(r),
          r.channel,
        ]
          .map((c) => `"${String(c).replace(/"/g, '""')}"`)
          .join(","),
      ),
    ];
    const blob = new Blob(["\uFEFF" + lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `info-records-${workType}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`已导出 ${rows.length} 条（上限 ${INFO_EXPORT_LIMIT}）`);
  };

  return (
    <div className="a-stack c-verify-page">
      {toast ? <div className="a-toast">{toast}</div> : null}

      <div className="a-card">
        <div className="c-verify-tabbar">
          <div className="a-tabs c-verify-tabs" role="tablist">
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
          <ApiDocLink productId="info" />
        </div>

        <div className="a-card__body a-stack">
          <div className="c-verify-panel-head">
            <h2 className="c-verify-panel-head__title">
              版权登记信息核验 · {INFO_WORK_TYPE_LABEL[workType]}
            </h2>
          </div>

          <div className="c-verify-form-row">
            <input
              className="a-input"
              placeholder="登记号（必填）"
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
            登记号必填；{nameLabel}与著作权人至少填一项 · 演示：2024SR001234 / 2024ZP001234 /
            2024SJ001234 配合正确名称或著作权人可核验通过；作品页签可试 2024ZP009999 填错著作权人
          </p>

          {error ? <div className="a-field__error">{error}</div> : null}

          {latest ? (
            <div
              className={`a-result${infoVerifyPassed(latest.status) ? " a-result--ok" : " a-result--er"}`}
            >
              <div className="a-result__head">
                <span
                  className={`a-dot ${infoVerifyPassed(latest.status) ? "a-dot--ok" : "a-dot--er"}`}
                />
                <span className="a-result__title">{infoVerifyTitle(latest.status)}</span>
              </div>
              <div className="a-desc c-dci-result-desc">
                <div className="a-desc__item c-dci-result-desc__code a-desc__item--wide">
                  <span className="a-desc__label">核验编码：</span>
                  <span className="a-desc__value">{latest.verifyCode}</span>
                  <span className="c-dci-result-desc__meta">{latest.verifiedAt}</span>
                </div>
                {infoSubmittedFieldRows(latest).map((row) => (
                  <div key={row.field} className="a-desc__item">
                    <span className="a-desc__label">{row.label}：</span>
                    <span className="a-desc__value">
                      {row.field === "regNo" ? <code>{row.value}</code> : row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <ProductUsagePanel product="info" />

      <div className="a-card">
        <div className="a-card__head">
          核验记录
          <div className="a-card__extra">默认近 {INFO_DEFAULT_DAYS} 天</div>
        </div>
        <div className="a-toolbar">
          <div className="a-field">
            <span className="a-field__label">时间范围</span>
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
          <div className="a-field">
            <span className="a-field__label">方式</span>
            <select
              className="a-select"
              value={draft.channel}
              onChange={(e) => setDraft((p) => ({ ...p, channel: e.target.value }))}
            >
              <option value="">全部</option>
              <option value="WebUI">WebUI</option>
              <option value="API">API</option>
            </select>
          </div>
          <div className="a-field">
            <span className="a-field__label">关键词</span>
            <input
              className="a-input"
              placeholder="登记号 / 名称 / 著作权人"
              value={draft.keyword}
              onChange={(e) => setDraft((p) => ({ ...p, keyword: e.target.value }))}
            />
          </div>
          <div className="a-toolbar__right">
            <button
              type="button"
              className="a-btn a-btn--primary a-btn--sm"
              onClick={() => {
                setApplied({ ...draft });
                setPage(1);
              }}
            >
              查询
            </button>
            <button
              type="button"
              className="a-btn a-btn--sm"
              onClick={() => {
                const next = { from: range0.from, to: range0.to, keyword: "", channel: "" };
                setDraft(next);
                setApplied(next);
                setPage(1);
              }}
            >
              重置
            </button>
            <button type="button" className="a-btn a-btn--sm" onClick={exportExcel}>
              导出 Excel
            </button>
          </div>
        </div>
        <div className="a-card__body a-card__body--flush">
          <div className="a-table-wrap">
            <table className="a-table">
              <thead>
                <tr>
                  <th>核验时间</th>
                  <th>登记号</th>
                  <th>{nameLabel}</th>
                  <th>著作权人</th>
                  <th>方式</th>
                  <th>结果</th>
                  {VERIFY_DETAIL_DRAWER_ENABLED ? <th>操作</th> : null}
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={VERIFY_DETAIL_DRAWER_ENABLED ? 7 : 6}>
                      <div className="a-empty">暂无核验记录</div>
                    </td>
                  </tr>
                ) : (
                  pageRows.map((r) => (
                    <tr key={r.id}>
                      <td>{r.verifiedAt}</td>
                      <td>{r.regNo}</td>
                      <td>
                        <div className="a-cell-clamp" title={r.name}>
                          {r.name}
                        </div>
                      </td>
                      <td>
                        <div className="a-cell-clamp" title={r.owner}>
                          {r.owner}
                        </div>
                      </td>
                      <td>{r.channel}</td>
                      <td>
                        <span
                          className={`a-tag ${infoVerifyPassed(r.status) ? "a-tag--ok" : "a-tag--er"}`}
                        >
                          {INFO_STATUS_LABEL[r.status]}
                        </span>
                      </td>
                      {VERIFY_DETAIL_DRAWER_ENABLED ? (
                        <td style={{ whiteSpace: "nowrap" }}>
                          <button
                            type="button"
                            className="a-btn a-btn--text a-btn--sm"
                            onClick={() => setDetail(r)}
                          >
                            详情
                          </button>
                        </td>
                      ) : null}
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

      <ServiceDisclaimer />

      {VERIFY_DETAIL_DRAWER_ENABLED ? (
        <InfoDetailDrawer
          open={Boolean(detail)}
          result={detail}
          onClose={() => setDetail(null)}
          onToast={showToast}
        />
      ) : null}
    </div>
  );
}
