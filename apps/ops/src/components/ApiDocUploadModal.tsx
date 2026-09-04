import { useEffect, useRef, useState } from "react";
import { IconPdf, IconUpload } from "@/components/icons/UiIcons";
import type { ApiDocFile } from "@/lib/apiServicesStore";

const MAX_BYTES = 50 * 1024 * 1024;
const ACCEPT_EXT = ["doc", "docx", "pdf", "md", "txt", "xls", "xlsx"] as const;
const ACCEPT_ATTR = ".doc,.docx,.pdf,.md,.txt,.xls,.xlsx";

type Props = {
  open: boolean;
  /** 更新时传入已有文档，便于先移除再换新 */
  initialFile?: ApiDocFile | null;
  onClose: () => void;
  onConfirm: (file: ApiDocFile) => void;
};

function extOf(name: string) {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
}

function isAllowed(file: File) {
  return (ACCEPT_EXT as readonly string[]).includes(extOf(file.name));
}

function toDocFile(file: File): ApiDocFile {
  return {
    id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: file.name,
    size: file.size,
    url: URL.createObjectURL(file),
  };
}

export function ApiDocUploadModal({ open, initialFile = null, onClose, onConfirm }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<ApiDocFile | null>(null);
  const [dragging, setDragging] = useState(false);
  const [warn, setWarn] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setPending(initialFile ?? null);
    setWarn(null);
    setError(null);
    setDragging(false);
  }, [open, initialFile]);

  if (!open) return null;

  const showWarn = (msg: string) => {
    setWarn(msg);
    window.setTimeout(() => setWarn(null), 2600);
  };

  const tryAddFile = (file: File | null | undefined) => {
    if (!file) return;
    if (pending) {
      showWarn("只能上传一个文件，请先移除已有文件");
      return;
    }
    if (!isAllowed(file)) {
      setError("不支持的文件格式，请上传 doc / docx / pdf / md / txt / xls / xlsx");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("文件大小不能超过 50MB");
      return;
    }
    setError(null);
    setPending(toDocFile(file));
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    tryAddFile(file);
  };

  const submit = () => {
    if (!pending) {
      setError("请先选择要上传的文件");
      return;
    }
    onConfirm(pending);
  };

  return (
    <div className="a-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="a-modal a-modal--md a-doc-upload-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="api-doc-upload-title"
        onClick={(e) => e.stopPropagation()}
      >
        {warn ? (
          <div className="a-doc-upload-modal__warn" role="status">
            <span className="a-doc-upload-modal__warn-icon" aria-hidden>
              !
            </span>
            <span>{warn}</span>
          </div>
        ) : null}

        <div className="a-doc-upload-modal__head">
          <h3 id="api-doc-upload-title" className="a-modal__title">
            上传接口文档
          </h3>
          <button
            type="button"
            className="a-doc-upload-modal__close"
            aria-label="关闭"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div
          className={`a-doc-upload-modal__drop${dragging ? " is-dragging" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => {
            if (pending) {
              showWarn("只能上传一个文件，请先移除已有文件");
              return;
            }
            inputRef.current?.click();
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (pending) {
                showWarn("只能上传一个文件，请先移除已有文件");
                return;
              }
              inputRef.current?.click();
            }
          }}
        >
          <span className="a-doc-upload-modal__icon" aria-hidden>
            <IconUpload size={36} />
          </span>
          <p className="a-doc-upload-modal__tip">
            将文件拖到此处，或
            <span className="a-doc-upload-modal__link">点击上传</span>
          </p>
          <input
            ref={inputRef}
            type="file"
            hidden
            accept={ACCEPT_ATTR}
            onChange={(e) => {
              tryAddFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>

        <p className="a-doc-upload-modal__hint">
          支持 doc / docx / pdf / md / txt / xls / xlsx 格式，文件大小不超过 50MB
        </p>

        {pending ? (
          <div className="a-doc-upload-modal__file">
            <IconPdf />
            <span className="a-doc-upload-modal__file-name" title={pending.name}>
              {pending.name}
            </span>
            <button
              type="button"
              className="a-doc-upload-modal__file-remove"
              aria-label="移除文件"
              onClick={() => {
                setPending(null);
                setError(null);
              }}
            >
              ×
            </button>
          </div>
        ) : null}

        {error ? <div className="a-form-error">{error}</div> : null}

        <div className="a-modal__actions a-doc-upload-modal__actions">
          <button type="button" className="a-btn a-btn--primary" onClick={submit}>
            上传
          </button>
          <button type="button" className="a-btn" onClick={onClose}>
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
