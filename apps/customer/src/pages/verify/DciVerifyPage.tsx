import { useMemo, useState } from "react";
import { ProductUsagePanel } from "@/components/ProductUsagePanel";
import { ServiceDisclaimer } from "@/components/ServiceDisclaimer";
import { ApiDocLink } from "@/components/verify/ApiDocLink";
import { BatchDciModal } from "@/components/verify/BatchDciModal";
import { DciDetailDrawer } from "@/components/verify/DciDetailDrawer";
import {
  CHANNEL_LABEL,
  DCI_BATCH_LIMIT,
  DCI_DAILY_LIMIT,
  DCI_DEFAULT_DAYS,
  DCI_EXPORT_LIMIT,
  MOCK_DCI_RECORDS,
  PAGE_SIZES,
  STATUS_LABEL,
  WORK_TYPE_LABEL,
  dciNameLabel,
  emptyDciForm,
  formatDciFailReasons,
  formatMismatchTags,
  isValidDciCode,
  normalizeDciCode,
  parseDciInputList,
  validateDciForm,
  verifyDciBatch,
  verifyDciOnce,
  type DciChannel,
  type DciVerifyInput,
  type DciVerifyResult,
  type DciWorkType,
} from "@/lib/dci";
import { copyText } from "@/lib/keys";

type Filters = {
  from: string;
  to: string;
  status: string;
  keyword: string;
  channel: string;
};

function defaultDateRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - DCI_DEFAULT_DAYS);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { from: fmt(from), to: fmt(to) };
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M10.5 5.5V4A1.5 1.5 0 0 0 9 2.5H4A1.5 1.5 0 0 0 2.5 4v5A1.5 1.5 0 0 0 4 10.5h1.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function ResultCard({
  result,
  onCopy,
}: {
  result: DciVerifyResult;
  onCopy: (code: string) => void;
}) {
  const ok = result.status === "pass";
  const nameLabel = dciNameLabel(result.workType);
  const title =
    result.status === "pass"
      ? "核验通过"
      : result.status === "not_found"
        ? "DCI不存在"
        : "核验未通过";
  const reasons = formatDciFailReasons(result);

  return (
    <div className={`a-result${ok ? " a-result--ok" : " a-result--er"}`}>
      <div className="a-result__head">
        <span className={`a-dot ${ok ? "a-dot--ok" : "a-dot--er"}`} />
        <span className="a-result__title">{title}</span>
      </div>
      <div className="a-desc c-dci-result-desc">
        <div className="a-desc__item c-dci-result-desc__code a-desc__item--wide">
          <span className="a-desc__label">核验编码：</span>
          <span className="a-desc__value">{result.verifyCode}</span>
          <button
            type="button"
            className="c-dci-copy"
            title="复制核验编码"
            aria-label="复制核验编码"
            onClick={() => onCopy(result.verifyCode)}
          >
            <CopyIcon />
          </button>
          <span className="c-dci-result-desc__meta">{result.verifiedAt}</span>
        </div>
        <div className="a-desc__item">
          <span className="a-desc__label">DCI 核验码：</span>
          <span className="a-desc__value">
            <code>{result.dciCode}</code>
          </span>
        </div>
        <div className="a-desc__item">
          <span className="a-desc__label">著作权人：</span>
          <span className="a-desc__value">{result.queryOwner || "—"}</span>
        </div>
        <div className="a-desc__item">
          <span className="a-desc__label">{nameLabel}：</span>
          <span className="a-desc__value">{result.queryName || "—"}</span>
        </div>
        {!ok && reasons.length > 0 ? (
          <div className="a-desc__item a-desc__item--wide">
            <span className="a-desc__label">原因：</span>
            <span className="a-desc__value">{reasons.join("；")}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function DciVerifyPage() {
  const range0 = defaultDateRange();
  const [workType, setWorkType] = useState<DciWorkType>("software");
  const [form, setForm] = useState<DciVerifyInput>(() => emptyDciForm());
  const [batchText, setBatchText] = useState("");
  const [batchOpen, setBatchOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [latest, setLatest] = useState<DciVerifyResult[]>([]);
  const [records, setRecords] = useState<DciVerifyResult[]>(() => [...MOCK_DCI_RECORDS]);
  const [detail, setDetail] = useState<DciVerifyResult | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [draft, setDraft] = useState<Filters>({
    from: range0.from,
    to: range0.to,
    status: "",
    keyword: "",
    channel: "",
  });
  const [applied, setApplied] = useState<Filters>({ ...draft });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(10);
  const [jump, setJump] = useState("");

  const nameLabel = dciNameLabel(workType);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const syncRecords = () => setRecords([...MOCK_DCI_RECORDS]);

  const setField = <K extends keyof DciVerifyInput>(key: K, value: DciVerifyInput[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
  };

  const filtered = useMemo(() => {
    const kw = applied.keyword.trim().toLowerCase();
    return records.filter((r) => {
      if (r.workType !== workType) return false;
      const day = r.verifiedAt.slice(0, 10);
      if (applied.from && day < applied.from) return false;
      if (applied.to && day > applied.to) return false;
      if (applied.status && r.status !== applied.status) return false;
      if (applied.channel && r.channel !== applied.channel) return false;
      if (
        kw &&
        !r.dciCode.toLowerCase().includes(normalizeDciCode(applied.keyword).toLowerCase()) &&
        !r.verifyCode.toLowerCase().includes(kw) &&
        !r.queryOwner.toLowerCase().includes(kw) &&
        !r.queryName.toLowerCase().includes(kw)
      ) {
        return false;
      }
      return true;
    });
  }, [records, workType, applied]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const onWorkTypeChange = (t: DciWorkType) => {
    setWorkType(t);
    setForm(emptyDciForm());
    setLatest([]);
    setError(null);
    setPage(1);
  };

  const copyVerifyCode = async (code: string) => {
    const ok = await copyText(code);
    showToast(ok ? "核验编码已复制" : "复制失败，请手动选择复制");
  };

  const runSingle = async () => {
    const err = validateDciForm(form);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await verifyDciOnce(form, workType);
      setLatest([result]);
      syncRecords();
      setPage(1);
    } finally {
      setLoading(false);
    }
  };

  const runBatch = async () => {
    setError(null);
    if (!form.owner.trim() && !form.name.trim()) {
      setError("批量核验前请先填写著作权人或名称（至少一项）");
      return;
    }
    const list = parseDciInputList(batchText);
    if (!list.length) {
      setError("请输入或上传至少一个 DCI 码");
      return;
    }
    const invalid = list.filter((c) => !isValidDciCode(c));
    if (invalid.length) {
      setError(
        `存在不合法 DCI 码：${invalid.slice(0, 3).join("、")}${invalid.length > 3 ? "…" : ""}`,
      );
      return;
    }
    const unique = [...new Set(list.map(normalizeDciCode))];
    if (unique.length > DCI_BATCH_LIMIT) {
      setError(`单次批量上限 ${DCI_BATCH_LIMIT} 条（去重后 ${unique.length} 条）`);
      return;
    }
    setLoading(true);
    try {
      const results = await verifyDciBatch(unique, workType, {
        owner: form.owner,
        name: form.name,
      });
      setLatest(results);
      syncRecords();
      setPage(1);
      setBatchOpen(false);
      showToast(`批量核验完成：${results.length} 条（同批已去重）`);
    } finally {
      setLoading(false);
    }
  };

  const onBatchFile = async (file: File) => {
    const text = await file.text();
    const lines = parseDciInputList(text.replace(/\t/g, "\n"));
    setBatchText(lines.join("\n"));
    showToast(`已导入 ${lines.length} 行`);
  };

  const exportExcel = () => {
    const rows = filtered.slice(0, DCI_EXPORT_LIMIT);
    const header = [
      "核验编码",
      "核验时间",
      "DCI码",
      "著作权人",
      nameLabel,
      "作品类型",
      "核验状态",
      "不一致字段",
      "核验方式",
      "核验人",
    ];
    const lines = [
      header.join(","),
      ...rows.map((r) =>
        [
          r.verifyCode,
          r.verifiedAt,
          r.dciCode,
          r.queryOwner,
          r.queryName,
          WORK_TYPE_LABEL[r.workType],
          STATUS_LABEL[r.status],
          formatMismatchTags(r),
          CHANNEL_LABEL[r.channel],
          r.verifier,
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
    a.download = `dci-records-${workType}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`已导出 ${rows.length} 条（上限 ${DCI_EXPORT_LIMIT}）`);
  };

  const demoHint =
    workType === "software" ? "SW" : workType === "work" ? "WK" : "DS";

  return (
    <div className="a-stack c-verify-page">
      {toast ? <div className="a-toast">{toast}</div> : null}

      <div className="a-card">
        <div className="c-verify-tabbar">
          <div className="a-tabs c-verify-tabs" role="tablist">
            {(Object.keys(WORK_TYPE_LABEL) as DciWorkType[]).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                className={`a-tabs__item${workType === t ? " is-active" : ""}`}
                aria-selected={workType === t}
                onClick={() => onWorkTypeChange(t)}
              >
                {WORK_TYPE_LABEL[t]}
              </button>
            ))}
          </div>
          <ApiDocLink productId="dci" />
        </div>

        <div className="a-card__body a-stack">
          <div className="c-verify-panel-head">
            <h2 className="c-verify-panel-head__title">
              DCI核验 · {WORK_TYPE_LABEL[workType]}
            </h2>
          </div>

          <div className="c-verify-form-row">
            <input
              className="a-input"
              placeholder="DCI 核验码（必填）"
              value={form.dciCode}
              onChange={(e) => setField("dciCode", e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void runSingle();
              }}
            />
            <input
              className="a-input"
              placeholder="著作权人"
              value={form.owner}
              onChange={(e) => setField("owner", e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void runSingle();
              }}
            />
            <input
              className="a-input"
              placeholder={nameLabel}
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void runSingle();
              }}
            />
            <button
              type="button"
              className="a-btn a-btn--primary"
              disabled={loading}
              onClick={() => void runSingle()}
            >
              {loading ? "核验中…" : "核验"}
            </button>
            <button
              type="button"
              className="a-btn"
              disabled={loading}
              onClick={() => {
                setError(null);
                setBatchOpen(true);
              }}
            >
              批量核验
            </button>
          </div>

          <p className="a-field__hint">
            DCI 核验码必填；著作权人与{nameLabel}至少填一项 · 单次批量上限 {DCI_BATCH_LIMIT} 条 ·
            每日上限 {DCI_DAILY_LIMIT} 条 · 演示码：DCI-{demoHint}DEMO0001
          </p>

          {error ? <div className="a-field__error">{error}</div> : null}

          {latest.length ? (
            <div className="a-stack">
              <div className="c-verify-section-title">
                核验结果{latest.length > 1 ? `（${latest.length}）` : ""}
              </div>
              {latest.map((r) => (
                <ResultCard
                  key={r.id}
                  result={r}
                  onCopy={(code) => void copyVerifyCode(code)}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <ProductUsagePanel product="dci" />

      <div className="a-card">
        <div className="a-card__head">
          核验记录
          <div className="a-card__extra">默认近 {DCI_DEFAULT_DAYS} 天</div>
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
              <option value="pass">通过</option>
              <option value="fail">未通过</option>
              <option value="not_found">DCI不存在</option>
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
              <option value="manual">WebUI</option>
              <option value="api">API</option>
            </select>
          </div>
          <div className="a-field">
            <span className="a-field__label">关键词</span>
            <input
              className="a-input"
              placeholder="DCI码 / 著作权人 / 名称"
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
                const next = {
                  from: range0.from,
                  to: range0.to,
                  status: "",
                  keyword: "",
                  channel: "",
                };
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
                  <th>DCI码</th>
                  <th>著作权人</th>
                  <th>{nameLabel}</th>
                  <th>方式</th>
                  <th>结果</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="a-empty">暂无核验记录</div>
                    </td>
                  </tr>
                ) : (
                  pageRows.map((r) => (
                    <tr key={r.id}>
                      <td>{r.verifiedAt}</td>
                      <td>
                        <code>{r.dciCode}</code>
                      </td>
                      <td>
                        <div className="a-cell-clamp" title={r.queryOwner || undefined}>
                          {r.queryOwner || "—"}
                          {r.mismatches?.includes("owner") ? (
                            <span className="a-tag a-tag--er" style={{ marginLeft: 6 }}>
                              不一致
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td>
                        <div className="a-cell-clamp" title={r.queryName || undefined}>
                          {r.queryName || "—"}
                          {r.mismatches?.includes("name") ? (
                            <span className="a-tag a-tag--er" style={{ marginLeft: 6 }}>
                              不一致
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td>{CHANNEL_LABEL[r.channel as DciChannel]}</td>
                      <td>
                        <span
                          className={`a-tag ${r.status === "pass" ? "a-tag--ok" : "a-tag--er"}`}
                        >
                          {STATUS_LABEL[r.status]}
                        </span>
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <button
                          type="button"
                          className="a-btn a-btn--text a-btn--sm"
                          onClick={() => setDetail(r)}
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
            <button type="button" disabled={safePage <= 1} onClick={() => setPage(1)}>
              首页
            </button>
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              上一页
            </button>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              下一页
            </button>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage(totalPages)}
            >
              尾页
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
            <span className="a-pagination__jump">
              跳至
              <input
                className="a-input"
                value={jump}
                onChange={(e) => setJump(e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && jump) {
                    setPage(Math.min(Math.max(1, Number(jump)), totalPages));
                  }
                }}
              />
              页
            </span>
          </div>
        </div>
      </div>

      <ServiceDisclaimer />

      <BatchDciModal
        open={batchOpen}
        loading={loading}
        text={batchText}
        onTextChange={setBatchText}
        onClose={() => setBatchOpen(false)}
        onSubmit={() => void runBatch()}
        onFile={(f) => void onBatchFile(f)}
      />

      <DciDetailDrawer
        open={Boolean(detail)}
        result={detail}
        onClose={() => setDetail(null)}
        onToast={showToast}
      />
    </div>
  );
}
