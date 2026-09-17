import { useMemo, useState } from "react";
import { ProductUsagePanel } from "@/components/ProductUsagePanel";
import { SectionGuideLayout } from "@/components/SectionGuideLayout";
import { ServiceDisclaimer } from "@/components/ServiceDisclaimer";
import { IconEye, IconReset, IconSearch } from "@/components/icons/UiIcons";
import { ApiDocLink } from "@/components/verify/ApiDocLink";
import { BatchInfoModal } from "@/components/verify/BatchInfoModal";
import { InfoDetailDrawer } from "@/components/verify/InfoDetailDrawer";
import { VerifyFailReasons } from "@/components/verify/VerifyFailReasons";
import {
  INFO_BATCH_LIMIT,
  INFO_DEFAULT_DAYS,
  INFO_STATUS_LABEL,
  INFO_WORK_TYPE_LABEL,
  MOCK_INFO_RECORDS,
  PAGE_SIZES,
  emptyInfoForm,
  formatInfoFailReasons,
  infoNameLabel,
  infoSubmittedFieldRows,
  infoVerifyPassed,
  infoVerifyTitle,
  parseInfoBatchFile,
  validateInfoBatchRows,
  validateInfoForm,
  verifyInfoBatch,
  verifyInfoOnce,
  type InfoBatchRow,
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
  status: string;
};

function InfoResultCard({ result }: { result: InfoVerifyResult }) {
  const ok = infoVerifyPassed(result.status);
  const failReasons = formatInfoFailReasons(result);
  return (
    <div className={`a-result${ok ? " a-result--ok" : " a-result--er"}`}>
      <div className="a-result__head c-cert-inline-result__status">
        <span className={`a-dot ${ok ? "a-dot--ok" : "a-dot--er"}`} />
        <div className="c-cert-inline-result__status-text">
          <span className="a-result__title">{infoVerifyTitle(result.status)}</span>
          {!ok ? <VerifyFailReasons reasons={failReasons} /> : null}
        </div>
      </div>
      <div className="a-desc c-dci-result-desc">
        <div className="a-desc__item c-dci-result-desc__code a-desc__item--wide">
          <span className="a-desc__label">核验编码：</span>
          <span className="a-desc__value">{result.verifyCode}</span>
          <span className="c-dci-result-desc__meta">{result.verifiedAt}</span>
        </div>
        {infoSubmittedFieldRows(result).map((row) => (
          <div key={row.field} className="a-desc__item">
            <span className="a-desc__label">{row.label}：</span>
            <span className="a-desc__value">
              {row.field === "regNo" ? <code>{row.value}</code> : row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function InfoVerifyPage() {
  const range0 = defaultDateRange();
  const [workType, setWorkType] = useState<InfoWorkType>("software");
  const [form, setForm] = useState<InfoVerifyInput>(() => emptyInfoForm("software"));
  const [batchRows, setBatchRows] = useState<InfoBatchRow[]>([]);
  const [batchFileName, setBatchFileName] = useState<string | null>(null);
  const [batchOpen, setBatchOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [latest, setLatest] = useState<InfoVerifyResult[]>([]);
  const [records, setRecords] = useState<InfoVerifyResult[]>(() => [...MOCK_INFO_RECORDS]);
  const [detail, setDetail] = useState<InfoVerifyResult | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [draft, setDraft] = useState<Filters>({
    from: range0.from,
    to: range0.to,
    keyword: "",
    channel: "",
    status: "",
  });
  const [applied, setApplied] = useState<Filters>({ ...draft });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(10);

  const nameLabel = infoNameLabel(workType);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const syncRecords = () => setRecords([...MOCK_INFO_RECORDS]);

  const onTabChange = (t: InfoWorkType) => {
    setWorkType(t);
    setForm(emptyInfoForm(t));
    setLatest([]);
    setError(null);
    setBatchOpen(false);
    setBatchRows([]);
    setBatchFileName(null);
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
      if (applied.status === "pass" && !infoVerifyPassed(r.status)) return false;
      if (applied.status === "fail" && infoVerifyPassed(r.status)) return false;
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
      setLatest([result]);
      syncRecords();
      setPage(1);
    } finally {
      setLoading(false);
    }
  };

  const runBatch = async () => {
    setError(null);
    const batchErr = validateInfoBatchRows(workType, batchRows);
    if (batchErr) {
      setError(batchErr);
      return;
    }
    setLoading(true);
    try {
      const results = await verifyInfoBatch(workType, batchRows);
      setLatest(results);
      syncRecords();
      setPage(1);
      setBatchOpen(false);
      setBatchRows([]);
      setBatchFileName(null);
      showToast(`批量核验完成：${results.length} 条（同批已去重）`);
    } finally {
      setLoading(false);
    }
  };

  const onBatchFile = async (file: File) => {
    try {
      const rows = await parseInfoBatchFile(file, workType);
      setBatchRows(rows);
      setBatchFileName(file.name);
      setError(null);
      showToast(`已导入 ${rows.length} 条`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "文件解析失败";
      setBatchRows([]);
      setBatchFileName(null);
      setError(msg);
    }
  };

  const openBatchModal = () => {
    setError(null);
    setBatchRows([]);
    setBatchFileName(null);
    setBatchOpen(true);
  };

  return (
    <>
      {toast ? <div className="a-toast">{toast}</div> : null}

      <SectionGuideLayout
        className="c-verify-page"
        footer={<ServiceDisclaimer />}
        sections={[
          {
            id: "verify",
            label: "版权登记信息核验",
            content: (
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
            <button
              type="button"
              className="a-btn"
              disabled={loading}
              onClick={openBatchModal}
            >
              批量核验
            </button>
          </div>

          <p className="a-field__hint">
            登记号必填；{nameLabel}与著作权人至少填一项 · 单次批量上限 {INFO_BATCH_LIMIT} 条 ·
            演示：2024SR001234 / 2024ZP001234 / 2024SJ001234 配合正确名称或著作权人可核验通过
          </p>

          {error ? <div className="a-field__error">{error}</div> : null}

          {latest.length ? (
            <div className="a-stack">
              <div className="c-verify-section-title">
                核验结果{latest.length > 1 ? `（${latest.length}）` : ""}
              </div>
              {latest.map((r) => (
                <InfoResultCard key={r.id} result={r} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
            ),
          },
          {
            id: "quota",
            label: "用量统计",
            content: <ProductUsagePanel product="info" />,
          },
          {
            id: "records",
            label: "核验记录",
            content: (
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
            <span className="a-field__label">结果</span>
            <select
              className="a-select"
              value={draft.status}
              onChange={(e) => setDraft((p) => ({ ...p, status: e.target.value }))}
            >
              <option value="">全部</option>
              <option value="pass">核验通过</option>
              <option value="fail">核验不通过</option>
            </select>
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
              <IconSearch />
              搜索
            </button>
            <button
              type="button"
              className="a-btn a-btn--outline a-btn--sm"
              onClick={() => {
                const next = {
                  from: range0.from,
                  to: range0.to,
                  keyword: "",
                  channel: "",
                  status: "",
                };
                setDraft(next);
                setApplied(next);
                setPage(1);
              }}
            >
              <IconReset />
              重置
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
                  <th>著作权人</th>
                  <th>{nameLabel}</th>
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
                        <div className="a-cell-clamp" title={r.owner}>
                          {r.owner}
                        </div>
                      </td>
                      <td>
                        <div className="a-cell-clamp" title={r.name}>
                          {r.name}
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
                            className="a-link-action"
                            onClick={() => setDetail(r)}
                          >
                            <IconEye />
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
            ),
          },
        ]}
      />

      <BatchInfoModal
        open={batchOpen}
        loading={loading}
        workType={workType}
        fileName={batchFileName}
        rowCount={batchRows.length}
        onClose={() => setBatchOpen(false)}
        onSubmit={() => void runBatch()}
        onFile={(f) => void onBatchFile(f)}
      />

      {VERIFY_DETAIL_DRAWER_ENABLED ? (
        <InfoDetailDrawer
          open={Boolean(detail)}
          result={detail}
          onClose={() => setDetail(null)}
          onToast={showToast}
        />
      ) : null}
    </>
  );
}
