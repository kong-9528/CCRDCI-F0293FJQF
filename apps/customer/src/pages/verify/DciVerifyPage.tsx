import { useMemo, useState } from "react";
import { ApiDocLink } from "@/components/verify/ApiDocLink";
import { BatchDciModal } from "@/components/verify/BatchDciModal";
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
  isValidDciCode,
  normalizeDciCode,
  parseDciInputList,
  verifyDciBatch,
  verifyDciOnce,
  type DciChannel,
  type DciVerifyResult,
  type DciWorkType,
} from "@/lib/dci";

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

function snapshotFields(result: DciVerifyResult): { label: string; value: string }[] {
  const s = result.snapshot;
  if (!s) return [{ label: "说明", value: result.message ?? "—" }];

  if (result.workType === "software") {
    return [
      { label: "DCI码", value: result.dciCode },
      { label: "软件名称", value: s.name },
      { label: "著作权人", value: s.owner },
      { label: "版本号", value: s.version ?? "—" },
      { label: "登记日期", value: s.registerDate },
      { label: "登记机构", value: s.agency },
      { label: "当前状态", value: s.currentStatus },
    ];
  }
  if (result.workType === "work") {
    return [
      { label: "DCI码", value: result.dciCode },
      { label: "作品名称", value: s.name },
      { label: "作品类型", value: s.workCategory ?? "—" },
      { label: "著作权人", value: s.owner },
      { label: "创作完成日期", value: s.completeDate ?? "—" },
      { label: "首次发表日期", value: s.publishDate ?? "—" },
      { label: "登记日期", value: s.registerDate },
      { label: "登记机构", value: s.agency },
      { label: "当前状态", value: s.currentStatus },
    ];
  }
  return [
    { label: "DCI码", value: result.dciCode },
    { label: "数据集名称", value: s.name },
    { label: "数据来源方", value: s.source ?? "—" },
    { label: "数据集规模", value: s.scale ?? "—" },
    { label: "数据类型", value: s.dataType ?? "—" },
    { label: "创作完成日期", value: s.completeDate ?? "—" },
    { label: "登记日期", value: s.registerDate },
    { label: "当前状态", value: s.currentStatus },
  ];
}

function ResultCard({
  result,
  onDownload,
}: {
  result: DciVerifyResult;
  onDownload: (r: DciVerifyResult) => void;
}) {
  const ok = result.status === "pass";
  return (
    <div className={`a-result${ok ? " a-result--ok" : " a-result--er"}`}>
      <div className="a-result__head">
        <span className={`a-dot ${ok ? "a-dot--ok" : "a-dot--er"}`} />
        <span className="a-result__title">{ok ? "核验通过" : "DCI不存在"}</span>
        <span className={`a-tag ${ok ? "a-tag--ok" : "a-tag--er"}`}>
          {STATUS_LABEL[result.status]}
        </span>
        <div className="a-result__actions">
          {ok ? (
            <button type="button" className="a-btn a-btn--sm" onClick={() => onDownload(result)}>
              下载核验报告 PDF
            </button>
          ) : null}
        </div>
      </div>
      {!ok ? (
        <p className="c-verify-hint">
          {result.message ?? "系统中无该DCI码记录"}，建议检查输入或联系管理员。
        </p>
      ) : null}
      <div className="a-desc">
        {snapshotFields(result).map((f) => (
          <div key={f.label} className="a-desc__item">
            <span className="a-desc__label">{f.label}</span>
            <span className="a-desc__value">{f.value}</span>
          </div>
        ))}
        <div className="a-desc__item">
          <span className="a-desc__label">核验时间</span>
          <span className="a-desc__value">{result.verifiedAt}</span>
        </div>
      </div>
    </div>
  );
}

export function DciVerifyPage() {
  const range0 = defaultDateRange();
  const [workType, setWorkType] = useState<DciWorkType>("software");
  const [singleCode, setSingleCode] = useState("");
  const [batchText, setBatchText] = useState("");
  const [batchOpen, setBatchOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [latest, setLatest] = useState<DciVerifyResult[]>([]);
  const [records, setRecords] = useState<DciVerifyResult[]>(() => [...MOCK_DCI_RECORDS]);
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

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const syncRecords = () => setRecords([...MOCK_DCI_RECORDS]);

  const filtered = useMemo(() => {
    return records.filter((r) => {
      if (r.workType !== workType) return false;
      const day = r.verifiedAt.slice(0, 10);
      if (applied.from && day < applied.from) return false;
      if (applied.to && day > applied.to) return false;
      if (applied.status && r.status !== applied.status) return false;
      if (applied.channel && r.channel !== applied.channel) return false;
      if (
        applied.keyword.trim() &&
        !r.dciCode.includes(normalizeDciCode(applied.keyword))
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
    setLatest([]);
    setError(null);
    setPage(1);
  };

  const downloadPdf = (r: DciVerifyResult) => {
    showToast(`已生成报告草稿（演示）：${r.dciCode}`);
  };

  const runSingle = async () => {
    setError(null);
    const code = normalizeDciCode(singleCode);
    if (!code) {
      setError("请输入 DCI 码");
      return;
    }
    if (!isValidDciCode(code)) {
      setError("DCI 码格式不正确，示例：DCI-SWDEMO0001");
      return;
    }
    setLoading(true);
    try {
      const result = await verifyDciOnce(code, workType);
      setLatest([result]);
      syncRecords();
      setPage(1);
    } finally {
      setLoading(false);
    }
  };

  const runBatch = async () => {
    setError(null);
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
      const results = await verifyDciBatch(unique, workType);
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
    const header = ["核验时间", "DCI码", "作品类型", "核验状态", "核验方式", "名称", "著作权人"];
    const lines = [
      header.join(","),
      ...rows.map((r) =>
        [
          r.verifiedAt,
          r.dciCode,
          WORK_TYPE_LABEL[r.workType],
          STATUS_LABEL[r.status],
          CHANNEL_LABEL[r.channel],
          r.snapshot?.name ?? "",
          r.snapshot?.owner ?? "",
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
        <div className="a-tabs" role="tablist">
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

        <div className="a-card__body a-stack">
          <div className="c-verify-panel-head">
            <h2 className="c-verify-panel-head__title">
              DCI核验 · {WORK_TYPE_LABEL[workType]}
            </h2>
            <ApiDocLink productId="dci" />
          </div>

          <div className="c-verify-input-row">
            <input
              className="a-input"
              placeholder="请输入 DCI 码，支持手动输入或粘贴"
              value={singleCode}
              onChange={(e) => setSingleCode(e.target.value)}
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
            单次批量上限 {DCI_BATCH_LIMIT} 条 · 每日上限 {DCI_DAILY_LIMIT} 条 · 演示码：
            DCI-{demoHint}DEMO0001
          </p>

          {error ? <div className="a-field__error">{error}</div> : null}

          {latest.length ? (
            <div className="a-stack">
              <div className="c-verify-section-title">
                核验结果{latest.length > 1 ? `（${latest.length}）` : ""}
              </div>
              {latest.map((r) => (
                <ResultCard key={r.id} result={r} onDownload={downloadPdf} />
              ))}
            </div>
          ) : null}
        </div>
      </div>

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
              <option value="not_found">未通过</option>
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
            <span className="a-field__label">DCI码</span>
            <input
              className="a-input"
              placeholder="关键词"
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
                  <th>类型</th>
                  <th>方式</th>
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
                      <td>
                        <code>{r.dciCode}</code>
                      </td>
                      <td>{WORK_TYPE_LABEL[r.workType]}</td>
                      <td>{CHANNEL_LABEL[r.channel as DciChannel]}</td>
                      <td>
                        <span
                          className={`a-tag ${r.status === "pass" ? "a-tag--ok" : "a-tag--er"}`}
                        >
                          {r.status === "pass" ? "通过" : "未通过"}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="a-btn a-btn--text a-btn--sm"
                          onClick={() => {
                            setLatest([r]);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                        >
                          详情
                        </button>
                        {r.status === "pass" ? (
                          <button
                            type="button"
                            className="a-btn a-btn--text a-btn--sm"
                            onClick={() => downloadPdf(r)}
                          >
                            报告
                          </button>
                        ) : null}
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

      <BatchDciModal
        open={batchOpen}
        loading={loading}
        text={batchText}
        onTextChange={setBatchText}
        onClose={() => setBatchOpen(false)}
        onSubmit={() => void runBatch()}
        onFile={(f) => void onBatchFile(f)}
      />
    </div>
  );
}
