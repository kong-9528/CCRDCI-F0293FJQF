import { useState } from "react";
import { CertFilePreviewModal } from "@/components/verify/CertFilePreviewModal";
import {
  CERT_RECOGNITION_FIELDS,
  formatCertFailReasons,
  type CertRecognition,
  type CertVerifyResult,
} from "@/lib/verifyCert";
import { copyText } from "@/lib/keys";

type Props = {
  result: CertVerifyResult;
};

const LEFT_KEYS: (keyof CertRecognition)[] = [
  "certTitleNo",
  "workName",
  "owner",
  "acquireMethod",
];
const RIGHT_KEYS: (keyof CertRecognition)[] = ["rightScope", "registerDate", "registerNo"];

function fieldLabel(key: keyof CertRecognition) {
  return CERT_RECOGNITION_FIELDS.find((f) => f.key === key)?.label ?? key;
}

function PassIcon() {
  return (
    <svg className="c-cert-outcome__hero-icon" viewBox="0 0 72 72" aria-hidden>
      <defs>
        <linearGradient id="c-cert-pass-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7eb6ff" />
          <stop offset="100%" stopColor="#2f6fe4" />
        </linearGradient>
      </defs>
      <ellipse cx="36" cy="62" rx="18" ry="5" fill="#d6e4ff" />
      <path
        d="M36 8 58 18v16c0 14-8.5 24-22 30C22.5 58 14 48 14 34V18L36 8Z"
        fill="url(#c-cert-pass-g)"
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

function FailIcon() {
  return (
    <svg className="c-cert-outcome__hero-icon" viewBox="0 0 72 72" aria-hidden>
      <defs>
        <linearGradient id="c-cert-fail-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff8a7a" />
          <stop offset="100%" stopColor="#e23b32" />
        </linearGradient>
      </defs>
      <ellipse cx="36" cy="62" rx="18" ry="5" fill="#ffd6d2" />
      <path d="M36 10 62 56H10L36 10Z" fill="url(#c-cert-fail-g)" />
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

function FieldCol({
  keys,
  rec,
}: {
  keys: (keyof CertRecognition)[];
  rec: CertRecognition;
}) {
  return (
    <dl className="c-cert-outcome__col">
      {keys.map((key) => (
        <div key={key} className="c-cert-outcome__field">
          <dt>{fieldLabel(key)}：</dt>
          <dd>{rec[key] || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

/** 提交页单条核验结果：通过 / 不通过 + 识别结果展开收起 */
export function CertInlineResult({ result }: Props) {
  const ok = result.status === "pass";
  const rec = result.recognition;
  const reasons = formatCertFailReasons(result);
  const badge = ok ? "核验通过" : reasons[0] || "核验不通过";
  const [open, setOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [preview, setPreview] = useState(false);

  const copyCode = async () => {
    const done = await copyText(result.verifyCode);
    if (!done) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <>
      <section className={`c-cert-outcome${ok ? " is-pass" : " is-fail"}`}>
        <header className="c-cert-outcome__head">
          <h3 className="c-cert-outcome__title">核验结果</h3>
          <span className="c-cert-outcome__source">数据来源：全球版权数据中心</span>
        </header>

        <div className="c-cert-outcome__summary">
          <div className="c-cert-outcome__status">
            {ok ? <PassIcon /> : <FailIcon />}
            <div className="c-cert-outcome__status-text">
              <div className="c-cert-outcome__status-title">
                {ok ? "证书信息核验通过" : "证书信息核验未通过"}
              </div>
              <div className="c-cert-outcome__meta">
                <span>核验编码：{result.verifyCode}</span>
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
              <div className="c-cert-outcome__meta">核验时间：{result.verifiedAt}</div>
            </div>
            <span className={`c-cert-outcome__badge${ok ? " is-ok" : " is-er"}`}>
              <span className="c-cert-outcome__badge-mark" aria-hidden>
                {ok ? "✓" : "×"}
              </span>
              {badge}
            </span>
          </div>

          <button
            type="button"
            className="c-cert-outcome__thumb"
            title="查看证书"
            onClick={() => setPreview(true)}
          >
            <img src={result.fileUrl} alt={result.fileName} />
          </button>
        </div>

        <div className="c-cert-outcome__recog">
          <div className="c-cert-outcome__recog-bar">
            <span className="c-cert-outcome__recog-title">识别结果</span>
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
              <FieldCol keys={LEFT_KEYS} rec={rec} />
              <FieldCol keys={RIGHT_KEYS} rec={rec} />
            </div>
          ) : null}
        </div>
      </section>

      <CertFilePreviewModal
        open={preview}
        fileName={result.fileName}
        fileUrl={result.fileUrl}
        fileKind={result.fileKind}
        onClose={() => setPreview(false)}
      />
    </>
  );
}
