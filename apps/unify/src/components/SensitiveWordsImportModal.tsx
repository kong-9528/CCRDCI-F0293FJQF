import { useEffect, useRef, useState } from "react";
import {
  RISK_LEVEL_LABEL,
  commitSensitiveWordsImport,
  downloadTextFile,
  getSensitiveWordsImportTemplateCsv,
  parseSensitiveWordsCsv,
  type SensitiveWordImportRow,
  type SensitiveWordParseResult,
} from "@/lib/sensitiveWordsStore";

type Step = "upload" | "preview" | "done";

type Props = {
  open: boolean;
  onClose: () => void;
  onImported?: (summary: { ok: number; failCount: number }) => void;
};

const MAX_BYTES = 2 * 1024 * 1024;

export function SensitiveWordsImportModal({ open, onClose, onImported }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("upload");
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<SensitiveWordParseResult | null>(null);
  const [result, setResult] = useState<{ ok: number; fail: string[] } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStep("upload");
    setDragging(false);
    setFileName("");
    setError(null);
    setParsed(null);
    setResult(null);
    setSubmitting(false);
    if (inputRef.current) inputRef.current.value = "";
  }, [open]);

  if (!open) return null;

  const downloadTemplate = () => {
    downloadTextFile("敏感词导入模板.csv", getSensitiveWordsImportTemplateCsv());
  };

  const applyCsvText = (name: string, text: string) => {
    const r = parseSensitiveWordsCsv(text);
    setFileName(name);
    setParsed(r);
    setError(null);
    if (!r.valid.length && !r.fail.length) {
      setError("文件中没有可识别的数据行");
      setStep("upload");
      return;
    }
    setStep("preview");
  };

  const tryReadFile = (file: File | null | undefined) => {
    if (!file) return;
    const lower = file.name.toLowerCase();
    if (!lower.endsWith(".csv") && !lower.endsWith(".txt")) {
      setError("请上传 .csv 或 .txt 文件");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("文件大小不能超过 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      applyCsvText(file.name, text);
    };
    reader.onerror = () => setError("读取文件失败，请重试");
    reader.readAsText(file, "UTF-8");
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    tryReadFile(e.dataTransfer.files?.[0]);
  };

  const confirmImport = () => {
    if (!parsed?.valid.length) return;
    setSubmitting(true);
    const committed = commitSensitiveWordsImport(parsed.valid);
    const fail = [...parsed.fail, ...committed.fail];
    setResult({ ok: committed.ok, fail });
    setStep("done");
    setSubmitting(false);
    onImported?.({ ok: committed.ok, failCount: fail.length });
  };

  const validPreview: SensitiveWordImportRow[] = parsed?.valid.slice(0, 8) ?? [];

  return (
    <div className="a-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="a-modal a-modal--md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sw-import-title"
        onClick={(e) => e.stopPropagation()}
        style={{ width: "min(560px, 96vw)" }}
      >
        <div className="a-modal__head" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <h3 id="sw-import-title" className="a-modal__title" style={{ margin: 0, flex: 1 }}>
            批量导入敏感词
          </h3>
          <button type="button" className="a-modal__close" aria-label="关闭" onClick={onClose}>
            ×
          </button>
        </div>

        {step === "upload" ? (
          <>
            <p className="a-modal__desc">
              请先下载模板，按「词条,危级,状态,备注」填写后上传。危级仅支持：高危 / 中危 / 低危；状态可选：启用 /
              停用（缺省为启用）。
            </p>

            <div className="a-toolbar" style={{ padding: "0 0 12px", margin: 0 }}>
              <button type="button" className="a-btn a-btn--primary" onClick={downloadTemplate}>
                下载导入模板
              </button>
              <span className="a-muted" style={{ fontSize: 12 }}>
                建议使用 UTF-8 编码的 CSV
              </span>
            </div>

            <div
              className={`un-import-drop${dragging ? " is-dragging" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
              }}
            >
              <div className="un-import-drop__title">点击选择或拖拽文件到此处</div>
              <div className="un-import-drop__hint">支持 .csv / .txt，单文件不超过 2MB</div>
              <input
                ref={inputRef}
                type="file"
                accept=".csv,.txt,text/csv,text/plain"
                hidden
                onChange={(e) => {
                  tryReadFile(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </div>

            {error ? <div className="a-form-error" style={{ marginTop: 12 }}>{error}</div> : null}

            <div className="a-modal__actions">
              <button type="button" className="a-btn" onClick={onClose}>
                取消
              </button>
            </div>
          </>
        ) : null}

        {step === "preview" && parsed ? (
          <>
            <p className="a-modal__desc">
              文件：<strong>{fileName || "未命名"}</strong>
              {" · "}可导入 <strong>{parsed.valid.length}</strong> 条
              {parsed.fail.length ? (
                <>
                  {" · "}校验失败 <strong style={{ color: "#c62828" }}>{parsed.fail.length}</strong> 条
                </>
              ) : null}
            </p>

            {validPreview.length ? (
              <div className="a-card a-card--flush" style={{ marginBottom: 12, maxHeight: 200, overflow: "auto" }}>
                <table className="a-table">
                  <thead>
                    <tr>
                      <th>行号</th>
                      <th>词条</th>
                      <th>危级</th>
                      <th>状态</th>
                      <th>备注</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validPreview.map((r) => (
                      <tr key={`${r.line}-${r.word}`}>
                        <td>{r.line}</td>
                        <td>{r.word}</td>
                        <td>
                          <span className={`un-risk un-risk--${r.level}`}>
                            {RISK_LEVEL_LABEL[r.level]}
                          </span>
                        </td>
                        <td>{r.enabled ? "启用" : "停用"}</td>
                        <td>{r.note || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsed.valid.length > validPreview.length ? (
                  <div className="a-muted" style={{ padding: "8px 12px", fontSize: 12 }}>
                    仅预览前 {validPreview.length} 条，其余 {parsed.valid.length - validPreview.length}{" "}
                    条将一并导入
                  </div>
                ) : null}
              </div>
            ) : null}

            {parsed.fail.length ? (
              <div className="un-import-fail">
                <div className="un-import-fail__title">校验失败明细（不会导入）</div>
                <ul>
                  {parsed.fail.slice(0, 20).map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                {parsed.fail.length > 20 ? (
                  <div className="a-muted" style={{ fontSize: 12 }}>
                    另有 {parsed.fail.length - 20} 条未展示
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="a-modal__actions">
              <button
                type="button"
                className="a-btn"
                onClick={() => {
                  setStep("upload");
                  setParsed(null);
                  setFileName("");
                  setError(null);
                }}
              >
                重新选择
              </button>
              <button
                type="button"
                className="a-btn a-btn--primary"
                disabled={!parsed.valid.length || submitting}
                onClick={confirmImport}
              >
                {submitting ? "导入中…" : `确认导入 ${parsed.valid.length} 条`}
              </button>
            </div>
          </>
        ) : null}

        {step === "done" && result ? (
          <>
            <p className="a-modal__desc">
              成功导入 <strong>{result.ok}</strong> 条
              {result.fail.length ? (
                <>
                  ，失败 <strong style={{ color: "#c62828" }}>{result.fail.length}</strong> 条
                </>
              ) : (
                "。"
              )}
            </p>
            {result.fail.length ? (
              <div className="un-import-fail">
                <ul>
                  {result.fail.slice(0, 15).map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="a-modal__actions">
              <button type="button" className="a-btn a-btn--primary" onClick={onClose}>
                完成
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
