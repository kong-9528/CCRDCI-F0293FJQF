import { useEffect, useState } from "react";
import { VerifyFailReasons } from "@/components/verify/VerifyFailReasons";
import { formatCertFailReasons, type CertVerifyResult } from "@/lib/verifyCert";

type Props = {
  result: CertVerifyResult;
};

/** 与 DCI / 信息核验统一的结果卡片；字段为证书核验内容 */
export function CertInlineResult({ result }: Props) {
  const [recogOpen, setRecogOpen] = useState(false);
  const ok = result.status === "pass";
  const rec = result.recognition;
  const title = ok ? "核验通过" : "核验不通过";
  const failReasons = formatCertFailReasons(result);

  useEffect(() => {
    setRecogOpen(false);
  }, [result.id]);

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
          <div className="a-desc__item">
            <span className="a-desc__label">登记号：</span>
            <span className="a-desc__value">
              <code>{rec.registerNo}</code>
            </span>
          </div>
          <div className="a-desc__item">
            <span className="a-desc__label">软件名称：</span>
            <span className="a-desc__value">{rec.workName || "—"}</span>
          </div>
          <div className="a-desc__item">
            <span className="a-desc__label">著作权人：</span>
            <span className="a-desc__value">{rec.owner || "—"}</span>
          </div>
        </div>
      </div>

      <div className="c-cert-detail__section-bar c-cert-detail__section-bar--toggle">
        <span>识别结果</span>
        <button
          type="button"
          className="c-cert-detail__toggle"
          onClick={() => setRecogOpen((v) => !v)}
        >
          {recogOpen ? "收起" : "展开"}
          <span className={`c-cert-detail__chevron${recogOpen ? " is-open" : ""}`} aria-hidden>
            ▾
          </span>
        </button>
      </div>

      {recogOpen ? (
        <dl className="c-cert-detail__meta" style={{ paddingLeft: 0, paddingRight: 0 }}>
          <div className="c-cert-detail__row">
            <dt>证书号</dt>
            <dd>{rec.certTitleNo}</dd>
          </div>
          <div className="c-cert-detail__row">
            <dt>软件名称</dt>
            <dd>{rec.workName}</dd>
          </div>
          <div className="c-cert-detail__row">
            <dt>著作权人</dt>
            <dd>{rec.owner}</dd>
          </div>
          <div className="c-cert-detail__row">
            <dt>权利取得方式</dt>
            <dd>{rec.acquireMethod}</dd>
          </div>
          <div className="c-cert-detail__row">
            <dt>权利范围</dt>
            <dd>{rec.rightScope}</dd>
          </div>
          <div className="c-cert-detail__row">
            <dt>登记日期</dt>
            <dd>{rec.registerDate}</dd>
          </div>
          <div className="c-cert-detail__row">
            <dt>登记号</dt>
            <dd>{rec.registerNo}</dd>
          </div>
        </dl>
      ) : null}
    </div>
  );
}
