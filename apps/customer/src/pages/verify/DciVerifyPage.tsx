import { useMemo, useRef, useState } from "react";
import { ProductUsagePanel } from "@/components/ProductUsagePanel";
import { SectionGuideLayout } from "@/components/SectionGuideLayout";
import { ServiceDisclaimer } from "@/components/ServiceDisclaimer";
import { IconCopy, IconEye, IconReset, IconSearch } from "@/components/icons/UiIcons";
import { ApiDocLink } from "@/components/verify/ApiDocLink";
import { BatchDciModal } from "@/components/verify/BatchDciModal";
import { CertFilePreviewModal } from "@/components/verify/CertFilePreviewModal";
import { DciConfirmModal } from "@/components/verify/DciConfirmModal";
import { DciDetailDrawer } from "@/components/verify/DciDetailDrawer";
import { VerifyOutcomeCard } from "@/components/verify/VerifyOutcomeCard";
import {
  CHANNEL_LABEL,
  DCI_BATCH_LIMIT,
  DCI_DEFAULT_DAYS,
  DCI_NAME_LABEL,
  MOCK_DCI_RECORDS,
  PAGE_SIZES,
  STATUS_LABEL,
  createDciSelectedFile,
  emptyDciForm,
  formatDciFailReasons,
  isDciFileAllowed,
  isDciVerifyPass,
  normalizeDciCode,
  ocrDciFile,
  parseDciBatchFile,
  validateDciBatchRows,
  validateDciForm,
  verifyDciBatch,
  verifyDciOnce,
  type DciBatchRow,
  type DciChannel,
  type DciOcrDraft,
  type DciSelectedFile,
  type DciVerifyInput,
  type DciVerifyResult,
} from "@/lib/dci";
import { VERIFY_DETAIL_DRAWER_ENABLED } from "@/lib/verifyFeatureFlags";

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

function UploadIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
      <path
        d="M20 8v16M20 8l-6 6M20 8l6 6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 28v2a4 4 0 0 0 4 4h16a4 4 0 0 0 4-4v-2"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M8 2.5v7.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M5.2 7.5 8 10.3l2.8-2.8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M3 13h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M3.5 4.5h9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path
        d="M6 4.5V3.2A1.2 1.2 0 0 1 7.2 2h1.6A1.2 1.2 0 0 1 10 3.2v1.3"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M5 4.5 5.5 13h5L11 4.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function dciSubmittedFields(result: DciVerifyResult) {
  const rows: { label: string; value: string }[] = [
    { label: "DCI 核验码", value: result.dciCode || "—" },
  ];
  const owner = result.queryOwner.trim();
  const name = result.queryName.trim();
  if (owner && name && owner.toLowerCase() === name.toLowerCase()) {
    rows.push({ label: `著作权人 / ${DCI_NAME_LABEL}`, value: owner });
  } else {
    if (owner) rows.push({ label: "著作权人", value: owner });
    if (name) rows.push({ label: DCI_NAME_LABEL, value: name });
  }
  return rows;
}

export function DciVerifyPage() {
  const range0 = defaultDateRange();
  const inputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<DciVerifyInput>(() => emptyDciForm());
  const [selected, setSelected] = useState<DciSelectedFile | null>(null);
  const [ocrDraft, setOcrDraft] = useState<DciOcrDraft | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [batchRows, setBatchRows] = useState<DciBatchRow[]>([]);
  const [batchFileName, setBatchFileName] = useState<string | null>(null);
  const [batchOpen, setBatchOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [latest, setLatest] = useState<DciVerifyResult[]>([]);
  const [records, setRecords] = useState<DciVerifyResult[]>(() => [...MOCK_DCI_RECORDS]);
  const [detail, setDetail] = useState<DciVerifyResult | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [preview, setPreview] = useState<{
    fileName: string;
    fileUrl: string;
    fileKind: "image" | "pdf";
  } | null>(null);

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

  const busy = loading || recognizing || confirmLoading;

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const syncRecords = () => setRecords([...MOCK_DCI_RECORDS]);

  const setField = <K extends keyof DciVerifyInput>(key: K, value: DciVerifyInput[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
  };

  const revokeIfBlob = (url: string) => {
    if (url.startsWith("blob:")) URL.revokeObjectURL(url);
  };

  const clearSelected = () => {
    if (selected) revokeIfBlob(selected.fileUrl);
    setSelected(null);
    setOcrDraft(null);
    setConfirmOpen(false);
    setError(null);
  };

  const pickFile = (file: File | null) => {
    if (!file || busy) return;
    const err = isDciFileAllowed(file);
    if (err) {
      setError(err);
      return;
    }
    if (selected) revokeIfBlob(selected.fileUrl);
    setError(null);
    setLatest([]);
    setOcrDraft(null);
    setConfirmOpen(false);
    setBatchOpen(false);
    setForm(emptyDciForm());
    setSelected(createDciSelectedFile(file));
  };

  const filtered = useMemo(() => {
    const kw = applied.keyword.trim().toLowerCase();
    return records.filter((r) => {
      const day = r.verifiedAt.slice(0, 10);
      if (applied.from && day < applied.from) return false;
      if (applied.to && day > applied.to) return false;
      if (applied.status === "pass" && !isDciVerifyPass(r.status)) return false;
      if (applied.status === "fail" && isDciVerifyPass(r.status)) return false;
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
  }, [records, applied]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const runSingle = async () => {
    if (selected) return;
    const err = validateDciForm(form);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await verifyDciOnce(form);
      setLatest([result]);
      syncRecords();
      setPage(1);
    } finally {
      setLoading(false);
    }
  };

  const startRecognize = async () => {
    if (!selected || busy) return;
    setError(null);
    setRecognizing(true);
    try {
      const ocr = await ocrDciFile(selected.file, selected);
      setOcrDraft(ocr);
      setConfirmOpen(true);
    } catch {
      setError("文件识别失败，请重试");
    } finally {
      setRecognizing(false);
    }
  };

  const closeConfirm = () => {
    if (confirmLoading) return;
    setConfirmOpen(false);
    setOcrDraft(null);
  };

  const confirmFileVerify = async (draftOcr: DciOcrDraft) => {
    setConfirmLoading(true);
    try {
      const result = await verifyDciOnce(draftOcr.recognition);
      result.fileName = draftOcr.fileName;
      result.fileUrl = draftOcr.fileUrl;
      result.fileKind = draftOcr.fileKind;
      setLatest([result]);
      setConfirmOpen(false);
      setOcrDraft(null);
      syncRecords();
      setPage(1);
      showToast(isDciVerifyPass(result.status) ? "核验通过" : "核验不通过");
    } finally {
      setConfirmLoading(false);
    }
  };

  const onVerifyClick = () => {
    if (selected) {
      void startRecognize();
      return;
    }
    void runSingle();
  };

  const downloadSelected = () => {
    if (!selected) return;
    const a = document.createElement("a");
    a.href = selected.fileUrl;
    a.download = selected.fileName;
    a.click();
  };

  const runBatch = async () => {
    setError(null);
    const batchErr = validateDciBatchRows(batchRows);
    if (batchErr) {
      setError(batchErr);
      return;
    }
    setLoading(true);
    try {
      const results = await verifyDciBatch(batchRows);
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
      const rows = await parseDciBatchFile(file);
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
            label: "DCI核验",
            content: (
      <div className="a-card">
        <div className="a-card__body a-stack">
          <div className="c-verify-panel-head">
            <h2 className="c-verify-panel-head__title">DCI核验</h2>
            <ApiDocLink productId="dci" />
          </div>

          <div className="c-dci-submit">
            {!selected ? (
              <>
                <div className="c-dci-hybrid__fields">
                  <input
                    className="a-input"
                    placeholder="DCI 核验码（必填）"
                    value={form.dciCode}
                    disabled={busy}
                    onChange={(e) => {
                      setLatest([]);
                      setField("dciCode", e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void runSingle();
                    }}
                  />
                  <input
                    className="a-input"
                    placeholder={`著作权人 / ${DCI_NAME_LABEL}（必填）`}
                    value={form.owner || form.name}
                    disabled={busy}
                    onChange={(e) => {
                      const v = e.target.value;
                      setLatest([]);
                      setForm((p) => ({ ...p, owner: v, name: v }));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void runSingle();
                    }}
                  />
                </div>

                <div className="c-dci-hybrid__divider" aria-hidden>
                  <span>或</span>
                </div>

                <div
                  className={`c-cert-upload${dragOver ? " is-dragover" : ""}${busy ? " is-disabled" : ""}`}
                  role="button"
                  tabIndex={busy ? -1 : 0}
                  onClick={() => {
                    if (!busy) inputRef.current?.click();
                  }}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === " ") && !busy) {
                      e.preventDefault();
                      inputRef.current?.click();
                    }
                  }}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    if (!busy) setDragOver(true);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (!busy) setDragOver(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
                    setDragOver(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    pickFile(e.dataTransfer.files[0] ?? null);
                  }}
                >
                  <div className="c-cert-upload__icon">
                    <UploadIcon />
                  </div>
                  <div className="c-cert-upload__title">点击/拖拽文件到此处</div>
                  <div className="c-cert-upload__hint">
                    请上传 pdf、jpg、png 格式，且文件大小在 100M 以内的文件
                  </div>
                </div>
              </>
            ) : (
              <div className="c-cert-file-card">
                <button
                  type="button"
                  className="c-cert-file-card__thumb"
                  title="预览文件"
                  onClick={() =>
                    setPreview({
                      fileName: selected.fileName,
                      fileUrl: selected.fileUrl,
                      fileKind: selected.fileKind,
                    })
                  }
                >
                  <img src={selected.fileUrl} alt={selected.fileName} />
                  {selected.fileKind === "pdf" ? (
                    <span className="c-cert-thumb__badge">PDF</span>
                  ) : null}
                </button>
                <div className="c-cert-file-card__name" title={selected.fileName}>
                  {selected.fileName}
                </div>
                <div className="c-cert-file-card__actions">
                  <button
                    type="button"
                    className="c-cert-file-card__icon-btn"
                    title="下载"
                    aria-label="下载文件"
                    disabled={busy}
                    onClick={downloadSelected}
                  >
                    <DownloadIcon />
                  </button>
                  <button
                    type="button"
                    className="c-cert-file-card__icon-btn"
                    title="删除"
                    aria-label="删除文件"
                    disabled={busy}
                    onClick={clearSelected}
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            )}

            <input
              ref={inputRef}
              type="file"
              hidden
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                pickFile(e.target.files?.[0] ?? null);
                e.target.value = "";
              }}
            />

            <div className="c-dci-submit__actions">
              <button
                type="button"
                className="a-btn a-btn--primary"
                disabled={busy}
                onClick={onVerifyClick}
              >
                {recognizing ? "识别中…" : loading || confirmLoading ? "核验中…" : "核验"}
              </button>
              {!selected ? (
                <button
                  type="button"
                  className="a-btn"
                  disabled={busy}
                  onClick={openBatchModal}
                >
                  批量核验
                </button>
              ) : null}
            </div>

            <p className="a-field__hint">
              {selected
                ? "已选择文件：请确认后核验。删除文件后可恢复填写核验与批量核验。"
                : `可填写信息核验，或上传文件识别后核验 · 填写项均为必填 · 批量核验仅支持文本导入 · 单次批量上限 ${DCI_BATCH_LIMIT} 条 · 演示码：DCI-SWDEMO0001 / DCI-WKDEMO0001 / DCI-DSDEMO0001`}
            </p>
          </div>

          {error ? <div className="a-field__error">{error}</div> : null}

          {latest.length ? (
            <div className="a-stack">
              {latest.map((r) => {
                const ok = isDciVerifyPass(r.status);
                const reasons = formatDciFailReasons(r);
                return (
                  <VerifyOutcomeCard
                    key={r.id}
                    ok={ok}
                    statusTitle={ok ? "DCI核验通过" : "DCI核验未通过"}
                    verifyCode={r.verifyCode}
                    verifiedAt={r.verifiedAt}
                    badge={ok ? "核验通过" : reasons[0] || "核验不通过"}
                    fields={dciSubmittedFields(r)}
                    file={
                      r.fileUrl
                        ? {
                            fileName: r.fileName || "证书文件",
                            fileUrl: r.fileUrl,
                            fileKind: r.fileKind || "image",
                          }
                        : null
                    }
                  />
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
            ),
          },
          {
            id: "quota",
            label: "用量统计",
            content: <ProductUsagePanel product="dci" />,
          },
          {
            id: "records",
            label: "核验记录",
            content: (
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
              <option value="manual">WebUI</option>
              <option value="api">API</option>
            </select>
          </div>
          <div className="a-field">
            <span className="a-field__label">关键词</span>
            <input
              className="a-input"
              placeholder={`DCI码 / 著作权人 / ${DCI_NAME_LABEL}`}
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
                  status: "",
                  keyword: "",
                  channel: "",
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
                  <th>DCI码</th>
                  <th>{DCI_NAME_LABEL}</th>
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
                      <td>
                        <span className="a-code-cell">
                          <button
                            type="button"
                            className="a-link-action"
                            title="复制 DCI 码"
                            onClick={() => {
                              void navigator.clipboard?.writeText(r.dciCode);
                            }}
                          >
                            {r.dciCode}
                            <IconCopy />
                          </button>
                        </span>
                      </td>
                      <td>
                        <div className="a-cell-clamp" title={r.queryName || undefined}>
                          {r.queryName || "—"}
                        </div>
                      </td>
                      <td>
                        <div className="a-cell-clamp" title={r.queryOwner || undefined}>
                          {r.queryOwner || "—"}
                        </div>
                      </td>
                      <td>{CHANNEL_LABEL[r.channel as DciChannel]}</td>
                      <td>
                        <span
                          className={`a-tag ${isDciVerifyPass(r.status) ? "a-tag--ok" : "a-tag--er"}`}
                        >
                          {STATUS_LABEL[r.status]}
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
            ),
          },
        ]}
      />

      <BatchDciModal
        open={batchOpen}
        loading={loading}
        fileName={batchFileName}
        rowCount={batchRows.length}
        onClose={() => setBatchOpen(false)}
        onSubmit={() => void runBatch()}
        onFile={(f) => void onBatchFile(f)}
      />

      <DciConfirmModal
        open={confirmOpen}
        loading={confirmLoading}
        draft={ocrDraft}
        onClose={closeConfirm}
        onConfirm={(d) => void confirmFileVerify(d)}
      />

      <CertFilePreviewModal
        open={Boolean(preview)}
        fileName={preview?.fileName ?? ""}
        fileUrl={preview?.fileUrl ?? ""}
        fileKind={preview?.fileKind ?? "image"}
        onClose={() => setPreview(null)}
      />

      {VERIFY_DETAIL_DRAWER_ENABLED ? (
        <DciDetailDrawer
          open={Boolean(detail)}
          result={detail}
          onClose={() => setDetail(null)}
          onToast={showToast}
        />
      ) : null}
    </>
  );
}
