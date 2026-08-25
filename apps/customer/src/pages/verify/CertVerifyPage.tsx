import { useMemo, useRef, useState } from "react";
import { ApiDocLink } from "@/components/verify/ApiDocLink";
import { CertDetailDrawer } from "@/components/verify/CertDetailDrawer";
import {
  CERT_DEFAULT_DAYS,
  CERT_EXPORT_LIMIT,
  CERT_STATUS_LABEL,
  MOCK_CERT_RECORDS,
  PAGE_SIZES,
  confirmCertVerify,
  isCertFileAllowed,
  ocrCertFile,
  type CertOcrDraft,
  type CertVerifyResult,
} from "@/lib/verifyCert";

function defaultDateRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - CERT_DEFAULT_DAYS);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { from: fmt(from), to: fmt(to) };
}

type Filters = {
  from: string;
  to: string;
  status: string;
  channel: string;
};

export function CertVerifyPage() {
  const range0 = defaultDateRange();
  const inputRef = useRef<HTMLInputElement>(null);
  const [ocrDraft, setOcrDraft] = useState<CertOcrDraft | null>(null);
  const [latest, setLatest] = useState<CertVerifyResult | null>(null);
  const [records, setRecords] = useState<CertVerifyResult[]>(() => [...MOCK_CERT_RECORDS]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterDraft, setFilterDraft] = useState<Filters>({
    from: range0.from,
    to: range0.to,
    status: "",
    channel: "",
  });
  const [filterApplied, setFilterApplied] = useState<Filters>({ ...filterDraft });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(10);
  const [toast, setToast] = useState<string | null>(null);
  const [detail, setDetail] = useState<CertVerifyResult | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const day = r.verifiedAt.slice(0, 10);
      if (filterApplied.from && day < filterApplied.from) return false;
      if (filterApplied.to && day > filterApplied.to) return false;
      if (filterApplied.status && r.status !== filterApplied.status) return false;
      if (filterApplied.channel && r.channel !== filterApplied.channel) return false;
      return true;
    });
  }, [records, filterApplied]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleFile = async (file: File | null) => {
    if (!file) return;
    const err = isCertFileAllowed(file);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setLoading(true);
    setLatest(null);
    try {
      const ocr = await ocrCertFile(file);
      setOcrDraft(ocr);
    } finally {
      setLoading(false);
    }
  };

  const confirm = async () => {
    if (!ocrDraft) return;
    setLoading(true);
    try {
      const result = await confirmCertVerify(ocrDraft);
      setLatest(result);
      setOcrDraft(null);
      setRecords([...MOCK_CERT_RECORDS]);
      setPage(1);
      showToast(result.status === "pass" ? "证书核验通过" : "证书核验未通过");
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = () => {
    const rows = filtered.slice(0, CERT_EXPORT_LIMIT);
    const header = ["核验编码", "核验时间", "证书编号", "作品名称", "权利人", "结果", "文件名", "方式"];
    const lines = [
      header.join(","),
      ...rows.map((r) =>
        [
          r.verifyCode,
          r.verifiedAt,
          r.certNo,
          r.workName,
          r.owner,
          r.status === "pass" ? "通过" : "未通过",
          r.fileName,
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
    a.download = "cert-records.csv";
    a.click();
    URL.revokeObjectURL(url);
    showToast(`已导出 ${rows.length} 条（上限 ${CERT_EXPORT_LIMIT}）`);
  };

  return (
    <div className="a-stack c-verify-page">
      {toast ? <div className="a-toast">{toast}</div> : null}

      <div className="a-card">
        <div className="a-card__body a-stack">
          <div className="c-verify-panel-head">
            <h2 className="c-verify-panel-head__title">版权证书核验</h2>
            <ApiDocLink productId="cert" />
          </div>

          {!ocrDraft ? (
            <div
              className="c-cert-upload"
              role="button"
              tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                void handleFile(e.dataTransfer.files[0] ?? null);
              }}
            >
              <div className="c-cert-upload__icon">↑</div>
              <div className="c-cert-upload__title">点击或拖拽上传版权证书（PDF/图片）</div>
              <div className="c-cert-upload__hint">支持 PDF、JPG、PNG，单文件不超过 10MB</div>
              <input
                ref={inputRef}
                type="file"
                hidden
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
              />
            </div>
          ) : (
            <div className="a-result" style={{ borderColor: "var(--p-300)", background: "var(--p-50)" }}>
              <div className="a-result__head">
                <span className="a-result__title">OCR 识别完成，请确认信息</span>
              </div>
              <div className="a-desc">
                <div className="a-desc__item">
                  <span className="a-desc__label">证书编号</span>
                  <span className="a-desc__value">{ocrDraft.certNo}</span>
                </div>
                <div className="a-desc__item">
                  <span className="a-desc__label">作品名称</span>
                  <span className="a-desc__value">{ocrDraft.workName}</span>
                </div>
                <div className="a-desc__item">
                  <span className="a-desc__label">著作权人</span>
                  <span className="a-desc__value">{ocrDraft.owner}</span>
                </div>
                <div className="a-desc__item">
                  <span className="a-desc__label">登记日期</span>
                  <span className="a-desc__value">{ocrDraft.registerDate}</span>
                </div>
                <div className="a-desc__item">
                  <span className="a-desc__label">文件名</span>
                  <span className="a-desc__value">{ocrDraft.fileName}</span>
                </div>
              </div>
              <div className="a-inline-actions" style={{ marginTop: 12 }}>
                <button
                  type="button"
                  className="a-btn a-btn--primary a-btn--sm"
                  disabled={loading}
                  onClick={() => void confirm()}
                >
                  {loading ? "核验中…" : "确认并核验"}
                </button>
                <button
                  type="button"
                  className="a-btn a-btn--sm"
                  disabled={loading}
                  onClick={() => {
                    setOcrDraft(null);
                    setError(null);
                  }}
                >
                  重新上传
                </button>
              </div>
            </div>
          )}

          {loading && !ocrDraft ? (
            <p className="a-field__hint">正在识别证书内容…</p>
          ) : null}
          {error ? <div className="a-field__error">{error}</div> : null}

          {latest ? (
            <div
              className={`a-result${latest.status === "pass" ? " a-result--ok" : " a-result--er"}`}
            >
              <div className="a-result__head">
                <span className={`a-dot ${latest.status === "pass" ? "a-dot--ok" : "a-dot--er"}`} />
                <span className="a-result__title">{CERT_STATUS_LABEL[latest.status]}</span>
                <span
                  className={`a-tag ${latest.status === "pass" ? "a-tag--ok" : "a-tag--er"}`}
                >
                  {latest.status === "pass" ? "通过" : "未通过"}
                </span>
              </div>
              {latest.message ? <p className="c-verify-hint">{latest.message}</p> : null}
              <div className="a-desc">
                <div className="a-desc__item">
                  <span className="a-desc__label">证书编号</span>
                  <span className="a-desc__value">{latest.certNo}</span>
                </div>
                <div className="a-desc__item">
                  <span className="a-desc__label">作品名称</span>
                  <span className="a-desc__value">{latest.workName}</span>
                </div>
                <div className="a-desc__item">
                  <span className="a-desc__label">著作权人</span>
                  <span className="a-desc__value">{latest.owner}</span>
                </div>
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
          <div className="a-card__extra">默认近 {CERT_DEFAULT_DAYS} 天</div>
        </div>
        <div className="a-toolbar">
          <div className="a-field">
            <span className="a-field__label">时间范围</span>
            <div className="a-date-range">
              <input
                type="date"
                className="a-input"
                value={filterDraft.from}
                onChange={(e) => setFilterDraft((p) => ({ ...p, from: e.target.value }))}
              />
              <span>至</span>
              <input
                type="date"
                className="a-input"
                value={filterDraft.to}
                onChange={(e) => setFilterDraft((p) => ({ ...p, to: e.target.value }))}
              />
            </div>
          </div>
          <div className="a-field">
            <span className="a-field__label">核验状态</span>
            <select
              className="a-select"
              value={filterDraft.status}
              onChange={(e) => setFilterDraft((p) => ({ ...p, status: e.target.value }))}
            >
              <option value="">全部</option>
              <option value="pass">通过</option>
              <option value="fail">未通过</option>
            </select>
          </div>
          <div className="a-field">
            <span className="a-field__label">方式</span>
            <select
              className="a-select"
              value={filterDraft.channel}
              onChange={(e) => setFilterDraft((p) => ({ ...p, channel: e.target.value }))}
            >
              <option value="">全部</option>
              <option value="WebUI">WebUI</option>
              <option value="API">API</option>
            </select>
          </div>
          <div className="a-toolbar__right">
            <button
              type="button"
              className="a-btn a-btn--primary a-btn--sm"
              onClick={() => {
                setFilterApplied({ ...filterDraft });
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
                  channel: "",
                };
                setFilterDraft(next);
                setFilterApplied(next);
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
                  <th>证书</th>
                  <th>方式</th>
                  <th>结果</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="a-empty">暂无核验记录</div>
                    </td>
                  </tr>
                ) : (
                  pageRows.map((r) => (
                    <tr key={r.id}>
                      <td>{r.verifiedAt}</td>
                      <td>
                        <button
                          type="button"
                          className="c-cert-thumb"
                          title="查看证书"
                          aria-label={`查看证书 ${r.fileName}`}
                          onClick={() => setDetail(r)}
                        >
                          <img src={r.fileUrl} alt={r.fileName} />
                          {r.fileKind === "pdf" ? (
                            <span className="c-cert-thumb__badge">PDF</span>
                          ) : null}
                        </button>
                      </td>
                      <td>{r.channel}</td>
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
                          onClick={() => setDetail(r)}
                        >
                          查看
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

      <CertDetailDrawer
        open={Boolean(detail)}
        result={detail}
        onClose={() => setDetail(null)}
        onToast={showToast}
      />
    </div>
  );
}
