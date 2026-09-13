import { VerifyFailReasons } from "@/components/verify/VerifyFailReasons";
import {
  CERT_RECOGNITION_FIELDS,
  formatCertFailReasons,
  type CertVerifyResult,
} from "@/lib/verifyCert";

type Props = {
  result: CertVerifyResult;
};

/** 提交页核验结果：仅展示识别结果完整字段，不展示提交文本 */
export function CertInlineResult({ result }: Props) {
  const ok = result.status === "pass";
  const rec = result.recognition;
  const title = ok ? "核验通过" : "核验不通过";
  const failReasons = formatCertFailReasons(result);

  return (
    <div className="a-stack c-cert-inline-result">
      <div className="c-verify-section-title">核验结果</div>
      <div className={`a-result${ok ? " a-result--ok" : " a-result--er"}`}>
        <div className="a-result__head c-cert-inline-result__status">
          <span className={`a-dot ${ok ? "a-dot--ok" : "a-dot--er"}`} />
          <div className="c-cert-inline-result__status-text">
            <span className="a-result__title">{title}</span>
            {!ok ? <VerifyFailReasons reasons={failReasons} /> : null}
          </div>
        </div>
        <div className="a-desc c-dci-result-desc">
          <div className="a-desc__item c-dci-result-desc__code a-desc__item--wide">
            <span className="a-desc__label">核验编码：</span>
            <span className="a-desc__value">{result.verifyCode}</span>
            <span className="c-dci-result-desc__meta">{result.verifiedAt}</span>
          </div>
          {CERT_RECOGNITION_FIELDS.map((f) => (
            <div key={f.key} className="a-desc__item">
              <span className="a-desc__label">{f.label}：</span>
              <span className="a-desc__value">
                {f.key === "registerNo" || f.key === "certTitleNo" ? (
                  <code>{rec[f.key] || "—"}</code>
                ) : (
                  rec[f.key] || "—"
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
