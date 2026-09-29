import { useMemo, useRef, useState } from "react";
import { ProductUsagePanel } from "@/components/ProductUsagePanel";
import { SectionGuideLayout } from "@/components/SectionGuideLayout";
import { ServiceDisclaimer } from "@/components/ServiceDisclaimer";
import { IconEye, IconReset, IconSearch } from "@/components/icons/UiIcons";
import { ApiDocLink } from "@/components/verify/ApiDocLink";
import { BatchDciModal } from "@/components/verify/BatchDciModal";
import { CertFilePreviewModal } from "@/components/verify/CertFilePreviewModal";
import { DciDetailDrawer } from "@/components/verify/DciDetailDrawer";
import { VerifyOutcomeCard } from "@/components/verify/VerifyOutcomeCard";
import { PaneIconSearch } from "@/components/PaneHeader";
import {
  CHANNEL_LABEL,
  DCI_BATCH_LIMIT,
  DCI_BATCH_SUBJECT_LABEL,
  DCI_DEFAULT_DAYS,
  DCI_MOCK,
  DCI_NAME_LABEL,
  DCI_SAMPLE_FAIL_HINT,
  MOCK_DCI_RECORDS,
  PAGE_SIZES,
  STATUS_LABEL,
  VERIFY_KIND_FILTER_LABEL,
  createDciSelectedFile,
  emptyDciForm,
  formatDciFailReasons,
  formatDciSubmitSummary,
  isDciFileAllowed,
  isDciVerifyPass,
  isSampleVerifyKind,
  normalizeDciCode,
  parseDciBatchFile,
  validateDciBatchRows,
  validateDciForm,
  validateSampleHash,
  verifyDciBatch,
  verifyDciOnce,
  verifyDciSampleFile,
  verifyDciSampleHash,
  verifyKindListLabel,
  type DciBatchRow,
  type DciChannel,
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
  /** "" | "code" | "sample" */
  verifyKind: string;
};

type VerifyMode = "code" | "sample";
type SampleTab = "upload" | "hash";

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

function SubmitContentTipIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 7v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="8" cy="4.8" r="0.9" fill="currentColor" />
    </svg>
  );
}

function dciSubmittedFields(result: DciVerifyResult) {
  const rows: { label: string; value: string }[] = [
    { label: "DCI 码", value: result.dciCode || "—" },
  ];
  const owner = result.queryOwner.trim();
  const name = result.queryName.trim();
  if (owner && name && owner.toLowerCase() === name.toLowerCase()) {
    rows.push({ label: DCI_BATCH_SUBJECT_LABEL, value: owner });
  } else if (owner || name) {
    // 批量两列合并提交后通常相等；若仅一侧有值也按合并字段展示
    rows.push({ label: DCI_BATCH_SUBJECT_LABEL, value: owner || name });
  }
  return rows;
}

export function DciVerifyPage() {
  const range0 = defaultDateRange();
  const inputRef = useRef<HTMLInputElement>(null);
  const [verifyMode, setVerifyMode] = useState<VerifyMode>("code");
  const [sampleTab, setSampleTab] = useState<SampleTab>("upload");
  const [form, setForm] = useState<DciVerifyInput>(() => emptyDciForm());
  const [sampleHash, setSampleHash] = useState("");
  const [selected, setSelected] = useState<DciSelectedFile | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [batchRows, setBatchRows] = useState<DciBatchRow[]>([]);
  const [batchFileName, setBatchFileName] = useState<string | null>(null);
  const [batchOpen, setBatchOpen] = useState(false);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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
    verifyKind: "",
  });
  const [applied, setApplied] = useState<Filters>({ ...draft });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(10);
  const [jump, setJump] = useState("");

  const busy = loading;

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
    setError(null);
  };

  const resetVerifyUi = () => {
    clearSelected();
    setForm(emptyDciForm());
    setSampleHash("");
    setLatest([]);
    setError(null);
    setBatchOpen(false);
  };

  const switchVerifyMode = (mode: VerifyMode) => {
    if (mode === verifyMode) return;
    setVerifyMode(mode);
    resetVerifyUi();
  };

  const switchSampleTab = (tab: SampleTab) => {
    if (tab === sampleTab) return;
    setSampleTab(tab);
    clearSelected();
    setSampleHash("");
    setLatest([]);
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
      if (applied.verifyKind === "code" && r.verifyKind !== "code") return false;
      if (applied.verifyKind === "sample" && !isSampleVerifyKind(r.verifyKind)) return false;
      if (kw) {
        const hay = [
          r.dciCode,
          r.verifyCode,
          r.queryOwner,
          r.queryName,
          r.fileName ?? "",
          formatDciSubmitSummary(r),
        ]
          .join(" ")
          .toLowerCase();
        const codeKw = normalizeDciCode(applied.keyword).toLowerCase();
        if (!hay.includes(kw) && !(codeKw && r.dciCode.toLowerCase().includes(codeKw))) {
          return false;
        }
      }
      return true;
    });
  }, [records, applied]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const runCodeVerify = async () => {
    const err = validateDciForm(form);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await verifyDciOnce(form, "manual", true);
      setLatest([result]);
      syncRecords();
      setPage(1);
    } finally {
      setLoading(false);
    }
  };

  const runSampleFileVerify = async () => {
    if (!selected) {
      setError("请先上传作品样本文件");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await verifyDciSampleFile(selected);
      setLatest([result]);
      syncRecords();
      setPage(1);
      showToast(isDciVerifyPass(result.status) ? "核验通过" : "核验不通过");
    } finally {
      setLoading(false);
    }
  };

  const runSampleHashVerify = async () => {
    const err = validateSampleHash(sampleHash);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await verifyDciSampleHash(sampleHash);
      setLatest([result]);
      syncRecords();
      setPage(1);
      showToast(isDciVerifyPass(result.status) ? "核验通过" : "核验不通过");
    } finally {
      setLoading(false);
    }
  };

  const onVerifyClick = () => {
    if (verifyMode === "code") {
      void runCodeVerify();
      return;
    }
    if (sampleTab === "upload") {
      void runSampleFileVerify();
      return;
    }
    void runSampleHashVerify();
  };

  const downloadSelected = () => {
    if (!selected) return;
    const a = document.createElement("a");
    a.href = selected.fileUrl;
    a.download = selected.fileName;
    a.click();
  };

  const runBatch = async () => {
    setBatchError(null);
    const batchErr = validateDciBatchRows(batchRows);
    if (batchErr) {
      setBatchError(batchErr);
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
      setBatchError(null);
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
      const batchErr = validateDciBatchRows(rows);
      if (batchErr) {
        setBatchError(batchErr);
        return;
      }
      setBatchError(null);
      showToast(`已导入 ${rows.length} 条`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "文件解析失败";
      setBatchRows([]);
      setBatchFileName(null);
      setBatchError(msg);
    }
  };

  const openBatchModal = () => {
    setBatchError(null);
    setError(null);
    setBatchRows([]);
    setBatchFileName(null);
    setBatchOpen(true);
  };

  const renderOutcome = (r: DciVerifyResult) => {
    const ok = isDciVerifyPass(r.status);
    if (verifyMode === "sample") {
      return (
        <VerifyOutcomeCard
          key={r.id}
          ok={ok}
          statusTitle={ok ? "核验通过" : "核验不通过"}
          verifyCode={r.verifyCode}
          verifiedAt={r.verifiedAt}
          badge={ok ? "核验通过" : "核验不通过"}
          fields={[]}
          note={ok ? null : r.message || DCI_SAMPLE_FAIL_HINT}
          file={
            r.fileUrl
              ? {
                  fileName: r.fileName || "作品样本",
                  fileUrl: r.fileUrl,
                  fileKind: r.fileKind || "image",
                }
              : null
          }
        />
      );
    }
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
            icon: <PaneIconSearch />,
            headerActions: <ApiDocLink productId="dci" />,
            content: (
              <div className="a-card">
                <div className="a-card__body a-stack">
                  <div className="c-dci-mode-tabs" role="tablist" aria-label="核验方式">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={verifyMode === "code"}
                      className={`c-dci-mode-tabs__item${verifyMode === "code" ? " is-active" : ""}`}
                      onClick={() => switchVerifyMode("code")}
                    >
                      DCI码核验
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={verifyMode === "sample"}
                      className={`c-dci-mode-tabs__item${verifyMode === "sample" ? " is-active" : ""}`}
                      onClick={() => switchVerifyMode("sample")}
                    >
                      作品样本核验
                    </button>
                  </div>

                  <div className="c-dci-submit">
                    {verifyMode === "code" ? (
                      <>
                        <div className="c-dci-hybrid__fields">
                          <input
                            className="a-input"
                            placeholder="DCI 码（必填）"
                            value={form.dciCode}
                            disabled={busy}
                            onChange={(e) => {
                              setLatest([]);
                              setField("dciCode", e.target.value);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") void runCodeVerify();
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
                              if (e.key === "Enter") void runCodeVerify();
                            }}
                          />
                        </div>

                        <div className="c-dci-submit__actions">
                          <button
                            type="button"
                            className="a-btn a-btn--primary"
                            disabled={busy}
                            onClick={onVerifyClick}
                          >
                            {loading ? "核验中…" : "核验"}
                          </button>
                          <button
                            type="button"
                            className="a-btn"
                            disabled={busy}
                            onClick={openBatchModal}
                          >
                            批量核验
                          </button>
                        </div>

                        <p className="a-field__hint">
                          填写项均为必填 · 文本演示：{DCI_MOCK.swDemo} / {DCI_MOCK.wkDemo} /{" "}
                          {DCI_MOCK.dsDemo}，第二项任意填写即返回核验通过 · 单次批量上限{" "}
                          {DCI_BATCH_LIMIT} 条
                        </p>
                      </>
                    ) : (
                      <>
                        <div
                          className="c-dci-sample-tabs"
                          role="tablist"
                          aria-label="作品样本核验方式"
                        >
                          <button
                            type="button"
                            role="tab"
                            aria-selected={sampleTab === "upload"}
                            className={`c-dci-sample-tabs__item${sampleTab === "upload" ? " is-active" : ""}`}
                            onClick={() => switchSampleTab("upload")}
                          >
                            上传作品样本
                          </button>
                          <button
                            type="button"
                            role="tab"
                            aria-selected={sampleTab === "hash"}
                            className={`c-dci-sample-tabs__item${sampleTab === "hash" ? " is-active" : ""}`}
                            onClick={() => switchSampleTab("hash")}
                          >
                            输入作品哈希值
                          </button>
                        </div>

                        {sampleTab === "upload" ? (
                          <>
                            {!selected ? (
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
                                  if (e.currentTarget.contains(e.relatedTarget as Node | null))
                                    return;
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
                                  请上传 DCI 申领时提交的作品样本文件（pdf、jpg、png，100M 以内）
                                </div>
                              </div>
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
                                <div
                                  className="c-cert-file-card__name"
                                  title={selected.fileName}
                                >
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
                                {loading ? "核验中…" : "核验"}
                              </button>
                            </div>

                            <p className="a-field__hint">
                              请提交与 DCI 申领时一致的作品样本。演示：普通文件名返回核验通过；文件名含
                              fail / invalid / missing 返回核验不通过。
                            </p>
                          </>
                        ) : (
                          <>
                            <div className="c-dci-hybrid__fields">
                              <input
                                className="a-input"
                                placeholder="作品样本哈希值（必填）"
                                value={sampleHash}
                                disabled={busy}
                                onChange={(e) => {
                                  setLatest([]);
                                  setSampleHash(e.target.value);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") void runSampleHashVerify();
                                }}
                              />
                            </div>

                            <div className="c-dci-submit__actions">
                              <button
                                type="button"
                                className="a-btn a-btn--primary"
                                disabled={busy}
                                onClick={onVerifyClick}
                              >
                                {loading ? "核验中…" : "核验"}
                              </button>
                            </div>

                            <p className="a-field__hint">
                              请输入作品样本对应的哈希值。演示通过：{DCI_MOCK.sampleHashPass}
                            </p>
                          </>
                        )}
                      </>
                    )}
                  </div>

                  {error ? <div className="a-field__error">{error}</div> : null}

                  {latest.length ? (
                    <div className="a-stack">{latest.map((r) => renderOutcome(r))}</div>
                  ) : null}
                </div>
              </div>
            ),
          },
          {
            id: "quota",
            label: "用量统计",
            content: <ProductUsagePanel product="dci" hideHead />,
          },
          {
            id: "records",
            label: "核验记录",
            description: `默认近 ${DCI_DEFAULT_DAYS} 天`,
            content: (
              <div className="a-card">
                <div className="a-toolbar">
                  <div className="a-field">
                    <span className="a-field__label">时间范围</span>
                    <input
                      type="date"
                      className="a-input"
                      value={draft.from}
                      onChange={(e) => setDraft((p) => ({ ...p, from: e.target.value }))}
                    />
                    <span className="a-toolbar__sep">至</span>
                    <input
                      type="date"
                      className="a-input"
                      value={draft.to}
                      onChange={(e) => setDraft((p) => ({ ...p, to: e.target.value }))}
                    />
                  </div>
                  <div className="a-field">
                    <span className="a-field__label">核验类型</span>
                    <select
                      className="a-select"
                      value={draft.verifyKind}
                      onChange={(e) => setDraft((p) => ({ ...p, verifyKind: e.target.value }))}
                    >
                      <option value="">全部</option>
                      <option value="code">{VERIFY_KIND_FILTER_LABEL.code}</option>
                      <option value="sample">{VERIFY_KIND_FILTER_LABEL.sample}</option>
                    </select>
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
                  <div className="a-field a-field--grow">
                    <span className="a-field__label">关键词</span>
                    <input
                      className="a-input"
                      placeholder="DCI码 / 核验编码 / 著作权人 / 作品名 / 文件名 / 哈希"
                      value={draft.keyword}
                      onChange={(e) => setDraft((p) => ({ ...p, keyword: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          setApplied({ ...draft });
                          setPage(1);
                        }
                      }}
                    />
                  </div>
                  <div className="a-toolbar__right">
                    <button
                      type="button"
                      className="a-btn a-btn--primary"
                      onClick={() => {
                        setApplied({ ...draft });
                        setPage(1);
                      }}
                    >
                      <IconSearch />
                      查询
                    </button>
                    <button
                      type="button"
                      className="a-btn"
                      onClick={() => {
                        const next = {
                          from: range0.from,
                          to: range0.to,
                          status: "",
                          keyword: "",
                          channel: "",
                          verifyKind: "",
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

                <div className="a-card__body">
                  <div className="a-table-wrap c-dci-records-wrap">
                    <table className="a-table c-dci-records-table">
                      <colgroup>
                        <col className="c-dci-records-col--time" />
                        <col className="c-dci-records-col--kind" />
                        <col className="c-dci-records-col--submit" />
                        <col className="c-dci-records-col--channel" />
                        <col className="c-dci-records-col--status" />
                        {VERIFY_DETAIL_DRAWER_ENABLED ? (
                          <col className="c-dci-records-col--action" />
                        ) : null}
                      </colgroup>
                      <thead>
                        <tr>
                          <th>核验时间</th>
                          <th>核验类型</th>
                          <th>
                            <span className="c-dci-records-th-submit">
                              提交内容
                              <span className="c-dci-records-tip" tabIndex={0}>
                                <span className="c-dci-records-tip__icon" aria-label="提交内容说明">
                                  <SubmitContentTipIcon />
                                </span>
                                <span className="c-dci-records-tip__bubble" role="tooltip">
                                  DCI码/著作权人/作品名称/作品样本文件名/作品样本哈希值等
                                </span>
                              </span>
                            </span>
                          </th>
                          <th>方式</th>
                          <th>结果</th>
                          {VERIFY_DETAIL_DRAWER_ENABLED ? <th>操作</th> : null}
                        </tr>
                      </thead>
                      <tbody>
                        {pageRows.length === 0 ? (
                          <tr>
                            <td colSpan={VERIFY_DETAIL_DRAWER_ENABLED ? 6 : 5}>
                              <div className="a-empty">暂无核验记录</div>
                            </td>
                          </tr>
                        ) : (
                          pageRows.map((r) => {
                            const submitSummary = formatDciSubmitSummary(r);
                            return (
                              <tr key={r.id}>
                                <td className="c-dci-records-td--time">{r.verifiedAt}</td>
                                <td className="c-dci-records-td--kind">
                                  {verifyKindListLabel(r.verifyKind)}
                                </td>
                                <td className="c-dci-records-td--submit">
                                  <div className="a-cell-clamp" title={submitSummary}>
                                    {submitSummary}
                                  </div>
                                </td>
                                <td className="c-dci-records-td--channel">
                                  {CHANNEL_LABEL[r.channel as DciChannel]}
                                </td>
                                <td className="c-dci-records-td--status">
                                  <span
                                    className={`a-tag ${isDciVerifyPass(r.status) ? "a-tag--ok" : "a-tag--er"}`}
                                  >
                                    {STATUS_LABEL[r.status]}
                                  </span>
                                </td>
                                {VERIFY_DETAIL_DRAWER_ENABLED ? (
                                  <td className="c-dci-records-td--action">
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
                            );
                          })
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
        error={batchError}
        onClose={() => {
          setBatchOpen(false);
          setBatchError(null);
        }}
        onSubmit={() => void runBatch()}
        onFile={(f) => void onBatchFile(f)}
      />

      {preview ? (
        <CertFilePreviewModal
          open
          fileName={preview.fileName}
          fileUrl={preview.fileUrl}
          fileKind={preview.fileKind}
          onClose={() => setPreview(null)}
        />
      ) : null}

      {VERIFY_DETAIL_DRAWER_ENABLED && detail ? (
        <DciDetailDrawer open result={detail} onClose={() => setDetail(null)} />
      ) : null}
    </>
  );
}
