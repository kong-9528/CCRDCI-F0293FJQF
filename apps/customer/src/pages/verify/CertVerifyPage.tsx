import { useMemo, useRef, useState } from "react";
import { ProductUsagePanel } from "@/components/ProductUsagePanel";
import { SectionGuideLayout } from "@/components/SectionGuideLayout";
import { ServiceDisclaimer } from "@/components/ServiceDisclaimer";
import { IconEye, IconReset, IconSearch } from "@/components/icons/UiIcons";
import { ApiDocLink } from "@/components/verify/ApiDocLink";
import { CertConfirmModal } from "@/components/verify/CertConfirmModal";
import { CertDetailDrawer } from "@/components/verify/CertDetailDrawer";
import { CertFilePreviewModal } from "@/components/verify/CertFilePreviewModal";
import { CertInlineResult } from "@/components/verify/CertInlineResult";
import {
  CERT_DEFAULT_DAYS,
  CERT_STATUS_LABEL,
  MOCK_CERT_RECORDS,
  PAGE_SIZES,
  confirmCertVerify,
  createCertSelectedFile,
  isCertFileAllowed,
  ocrCertFile,
  type CertOcrDraft,
  type CertSelectedFile,
  type CertVerifyResult,
} from "@/lib/verifyCert";
import { VERIFY_DETAIL_DRAWER_ENABLED } from "@/lib/verifyFeatureFlags";

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
      <path d="M6 4.5V3.2A1.2 1.2 0 0 1 7.2 2h1.6A1.2 1.2 0 0 1 10 3.2v1.3" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M5 4.5 5.5 13h5L11 4.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CertVerifyPage() {
  const range0 = defaultDateRange();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<CertSelectedFile | null>(null);
  const [ocrDraft, setOcrDraft] = useState<CertOcrDraft | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [latest, setLatest] = useState<CertVerifyResult | null>(null);
  const [records, setRecords] = useState<CertVerifyResult[]>(() => [...MOCK_CERT_RECORDS]);
  const [error, setError] = useState<string | null>(null);
  const [recognizing, setRecognizing] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
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
  const [preview, setPreview] = useState<{
    fileName: string;
    fileUrl: string;
    fileKind: "image" | "pdf";
  } | null>(null);

  const busy = recognizing || confirmLoading;

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

  const revokeIfBlob = (url: string) => {
    if (url.startsWith("blob:")) URL.revokeObjectURL(url);
  };

  const clearSelected = () => {
    if (selected) revokeIfBlob(selected.fileUrl);
    setSelected(null);
    setOcrDraft(null);
    setConfirmOpen(false);
    setLatest(null);
    setError(null);
  };

  const pickFile = (file: File | null) => {
    if (!file || busy) return;
    const err = isCertFileAllowed(file);
    if (err) {
      setError(err);
      return;
    }
    if (selected) revokeIfBlob(selected.fileUrl);
    setError(null);
    setLatest(null);
    setOcrDraft(null);
    setConfirmOpen(false);
    setSelected(createCertSelectedFile(file));
  };

  const startRecognize = async () => {
    if (!selected || busy) return;
    setError(null);
    setRecognizing(true);
    try {
      const ocr = await ocrCertFile(selected.file, selected);
      setOcrDraft(ocr);
      setConfirmOpen(true);
    } catch {
      setError("证书识别失败，请重试");
    } finally {
      setRecognizing(false);
    }
  };

  const closeConfirm = () => {
    if (confirmLoading) return;
    setConfirmOpen(false);
    setOcrDraft(null);
  };

  const confirm = async (draft: CertOcrDraft) => {
    setConfirmLoading(true);
    try {
      const result = await confirmCertVerify(draft);
      setLatest(result);
      setConfirmOpen(false);
      setOcrDraft(null);
      setRecords([...MOCK_CERT_RECORDS]);
      setPage(1);
      showToast(result.status === "pass" ? "核验通过" : "核验不通过");
    } finally {
      setConfirmLoading(false);
    }
  };

  const downloadSelected = () => {
    if (!selected) return;
    const a = document.createElement("a");
    a.href = selected.fileUrl;
    a.download = selected.fileName;
    a.click();
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
            label: "版权登记证书核验",
            content: (
              <div className="a-card">
                <div className="a-card__body a-stack">
                  <div className="c-verify-panel-head">
                    <div className="c-verify-panel-head__main">
                      <h2 className="c-verify-panel-head__title">版权登记证书核验</h2>
                      <p className="c-verify-hint">仅支持单文件单证书核验</p>
                    </div>
                    <ApiDocLink productId="certificate" />
                  </div>

                  <div className="c-cert-submit">
                    {!selected ? (
                      <div
                        className="c-cert-upload"
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          if (!busy) inputRef.current?.click();
                        }}
                        onKeyDown={(e) => {
                          if ((e.key === "Enter" || e.key === " ") && !busy) {
                            inputRef.current?.click();
                          }
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          pickFile(e.dataTransfer.files[0] ?? null);
                        }}
                      >
                        <div className="c-cert-upload__icon">
                          <UploadIcon />
                        </div>
                        <div className="c-cert-upload__title">点击/拖拽证书文件到此处</div>
                        <div className="c-cert-upload__hint">
                          请上传 pdf、jpg、png 格式，且文件大小在 100M 以内的文件
                        </div>
                      </div>
                    ) : (
                      <div className="c-cert-file-card">
                        <button
                          type="button"
                          className="c-cert-file-card__thumb"
                          title="预览证书"
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
                            aria-label="下载证书文件"
                            disabled={busy}
                            onClick={downloadSelected}
                          >
                            <DownloadIcon />
                          </button>
                          <button
                            type="button"
                            className="c-cert-file-card__icon-btn"
                            title="删除"
                            aria-label="删除证书文件"
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

                    <button
                      type="button"
                      className="a-btn a-btn--primary c-cert-submit__btn"
                      disabled={!selected || busy}
                      onClick={() => void startRecognize()}
                    >
                      {recognizing ? "识别中..." : "核验"}
                    </button>

                    {error ? <div className="a-field__error">{error}</div> : null}

                    {latest ? <CertInlineResult result={latest} /> : null}
                  </div>
                </div>
              </div>
            ),
          },
          {
            id: "quota",
            label: "用量统计",
            content: <ProductUsagePanel product="certificate" />,
          },
          {
            id: "records",
            label: "核验记录",
            content: (
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
                        onChange={(e) =>
                          setFilterDraft((p) => ({ ...p, from: e.target.value }))
                        }
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
                    <span className="a-field__label">结果</span>
                    <select
                      className="a-select"
                      value={filterDraft.status}
                      onChange={(e) =>
                        setFilterDraft((p) => ({ ...p, status: e.target.value }))
                      }
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
                      value={filterDraft.channel}
                      onChange={(e) =>
                        setFilterDraft((p) => ({ ...p, channel: e.target.value }))
                      }
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
                          channel: "",
                        };
                        setFilterDraft(next);
                        setFilterApplied(next);
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
                          <th>证书</th>
                          <th>方式</th>
                          <th>结果</th>
                          {VERIFY_DETAIL_DRAWER_ENABLED ? <th>操作</th> : null}
                        </tr>
                      </thead>
                      <tbody>
                        {pageRows.length === 0 ? (
                          <tr>
                            <td colSpan={VERIFY_DETAIL_DRAWER_ENABLED ? 5 : 4}>
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
                                  title="查看证书大图"
                                  aria-label={`查看证书大图 ${r.fileName}`}
                                  onClick={() =>
                                    setPreview({
                                      fileName: r.fileName,
                                      fileUrl: r.fileUrl,
                                      fileKind: r.fileKind,
                                    })
                                  }
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
                                  className={`a-tag ${
                                    r.status === "pass" ? "a-tag--ok" : "a-tag--er"
                                  }`}
                                >
                                  {CERT_STATUS_LABEL[r.status]}
                                </span>
                              </td>
                              {VERIFY_DETAIL_DRAWER_ENABLED ? (
                                <td>
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
                    <button
                      type="button"
                      disabled={safePage <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
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

      <CertConfirmModal
        open={confirmOpen}
        loading={confirmLoading}
        draft={ocrDraft}
        onClose={closeConfirm}
        onConfirm={(draft) => void confirm(draft)}
      />

      <CertFilePreviewModal
        open={Boolean(preview)}
        fileName={preview?.fileName ?? ""}
        fileUrl={preview?.fileUrl ?? ""}
        fileKind={preview?.fileKind ?? "image"}
        onClose={() => setPreview(null)}
      />

      {VERIFY_DETAIL_DRAWER_ENABLED ? (
        <CertDetailDrawer
          open={Boolean(detail)}
          result={detail}
          onClose={() => setDetail(null)}
          onToast={showToast}
        />
      ) : null}
    </>
  );
}
