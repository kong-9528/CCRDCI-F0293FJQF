import { useId, useState } from "react";
import { CertFilePreviewModal } from "@/components/verify/CertFilePreviewModal";
import { copyText } from "@/lib/keys";

export type OutcomeField = { label: string; value: string };

type FilePreview = {
  fileName: string;
  fileUrl: string;
  fileKind: "image" | "pdf";
};

type Props = {
  ok: boolean;
  statusTitle: string;
  verifyCode: string;
  verifiedAt: string;
  badge: string;
  fields: OutcomeField[];
  file?: FilePreview | null;
};

function PassIcon({ id }: { id: string }) {
  return (
    <svg className="c-cert-outcome__hero-icon" viewBox="0 0 72 72" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7eb6ff" />
          <stop offset="100%" stopColor="#2f6fe4" />
        </linearGradient>
      </defs>
      <ellipse cx="36" cy="62" rx="18" ry="5" fill="#d6e4ff" />
      <path
        d="M36 8 58 18v16c0 14-8.5 24-22 30C22.5 58 14 48 14 34V18L36 8Z"
        fill={`url(#${id})`}
      />
      <path
        d="M27 36.5 33.2 43 46 28"
        fill="none"
        stroke="#fff"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FailIcon({ id }: { id: string }) {
  return (
    <svg className="c-cert-outcome__hero-icon" viewBox="0 0 72 72" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff8a7a" />
          <stop offset="100%" stopColor="#e23b32" />
        </linearGradient>
      </defs>
      <ellipse cx="36" cy="62" rx="18" ry="5" fill="#ffd6d2" />
      <path d="M36 10 62 56H10L36 10Z" fill={`url(#${id})`} />
      <path d="M36 28v14" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
      <circle cx="36" cy="48" r="2.4" fill="#fff" />
    </svg>
  );
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

/** 与证书核验结果同构：提交信息可展开，文件核验时右侧展示缩略图 */
export function VerifyOutcomeCard({
  ok,
  statusTitle,
  verifyCode,
  verifiedAt,
  badge,
  fields,
  file,
}: Props) {
  const rawId = useId().replace(/:/g, "");
  const [open, setOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [preview, setPreview] = useState(false);

  const copyCode = async () => {
    const done = await copyText(verifyCode);
    if (!done) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const mid = Math.ceil(fields.length / 2);
  const left = fields.slice(0, mid);
  const right = fields.slice(mid);

  return (
    <>
      <section className={`c-cert-outcome${ok ? " is-pass" : " is-fail"}`}>
        <header className="c-cert-outcome__head">
          <h3 className="c-cert-outcome__title">核验结果</h3>
          <span className="c-cert-outcome__source">数据来源：中国版权保护中心官方数据</span>
        </header>

        <div className="c-cert-outcome__summary">
          <div className="c-cert-outcome__status">
            {ok ? <PassIcon id={`${rawId}-pass`} /> : <FailIcon id={`${rawId}-fail`} />}
            <div className="c-cert-outcome__status-text">
              <div className="c-cert-outcome__status-title">{statusTitle}</div>
              <div className="c-cert-outcome__meta">
                <span>核验编码：{verifyCode}</span>
                <button
                  type="button"
                  className="c-cert-outcome__copy"
                  title={copied ? "已复制" : "复制核验编码"}
                  aria-label="复制核验编码"
                  onClick={() => void copyCode()}
                >
                  <CopyIcon />
                </button>
              </div>
              <div className="c-cert-outcome__meta">核验时间：{verifiedAt}</div>
            </div>
            <span className={`c-cert-outcome__badge${ok ? " is-ok" : " is-er"}`}>
              <span className="c-cert-outcome__badge-mark" aria-hidden>
                {ok ? "✓" : "×"}
              </span>
              {badge}
            </span>
          </div>

          {file ? (
            <button
              type="button"
              className="c-cert-outcome__thumb"
              title="查看文件"
              onClick={() => setPreview(true)}
            >
              <img src={file.fileUrl} alt={file.fileName} />
            </button>
          ) : null}
        </div>

        <div className="c-cert-outcome__recog">
          <div className="c-cert-outcome__recog-bar">
            <span className="c-cert-outcome__recog-title">提交信息</span>
            <button
              type="button"
              className="c-cert-outcome__toggle"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? "收起" : "展开"}
              <span className={`c-cert-outcome__chevron${open ? " is-open" : ""}`} aria-hidden>
                ▾
              </span>
            </button>
          </div>
          {open ? (
            <div className="c-cert-outcome__grid">
              <dl className="c-cert-outcome__col">
                {left.map((row) => (
                  <div key={row.label} className="c-cert-outcome__field">
                    <dt>{row.label}：</dt>
                    <dd>{row.value || "—"}</dd>
                  </div>
                ))}
              </dl>
              <dl className="c-cert-outcome__col">
                {right.map((row) => (
                  <div key={row.label} className="c-cert-outcome__field">
                    <dt>{row.label}：</dt>
                    <dd>{row.value || "—"}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
        </div>
      </section>

      {file ? (
        <CertFilePreviewModal
          open={preview}
          fileName={file.fileName}
          fileUrl={file.fileUrl}
          fileKind={file.fileKind}
          onClose={() => setPreview(false)}
        />
      ) : null}
    </>
  );
}
