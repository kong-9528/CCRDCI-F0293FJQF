import { Drawer } from "@/components/Drawer";
import { VerifyFailReasons } from "@/components/verify/VerifyFailReasons";
import { copyText } from "@/lib/keys";
import {
  CERT_RECOGNITION_FIELDS,
  formatCertFailReasons,
  type CertVerifyResult,
} from "@/lib/verifyCert";

type Props = {
  open: boolean;
  result: CertVerifyResult | null;
  onClose: () => void;
  onToast?: (msg: string) => void;
};

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

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
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

function ShieldOkIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden>
      <path
        d="M28 6 44 12.5v14.2c0 11.3-7.1 21.4-16 24.3-8.9-2.9-16-13-16-24.3V12.5L28 6Z"
        fill="url(#shieldGrad)"
      />
      <path
        d="M28 6 44 12.5v14.2c0 11.3-7.1 21.4-16 24.3-8.9-2.9-16-13-16-24.3V12.5L28 6Z"
        stroke="#0b62b8"
        strokeWidth="1.2"
        opacity="0.35"
      />
      <path
        d="M20.5 28.2 25.8 33.5 36 22.5"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="shieldGrad" x1="12" y1="8" x2="42" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3aa0ef" />
          <stop offset="1" stopColor="#0b62b8" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function ShieldFailIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden>
      <path
        d="M28 6 44 12.5v14.2c0 11.3-7.1 21.4-16 24.3-8.9-2.9-16-13-16-24.3V12.5L28 6Z"
        fill="url(#shieldFail)"
      />
      <path
        d="M22 22.5 34 34.5M34 22.5 22 34.5"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="shieldFail" x1="12" y1="8" x2="42" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f07171" />
          <stop offset="1" stopColor="#c62828" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function CertDetailDrawer({ open, result, onClose, onToast }: Props) {
  if (!result) {
    return null;
  }

  const ok = result.status === "pass";
  const rec = result.recognition;
  const failReasons = formatCertFailReasons(result);

  const copyCode = async () => {
    const done = await copyText(result.verifyCode);
    onToast?.(done ? "核验编码已复制" : "复制失败，请手动选择复制");
  };

  const downloadFile = () => {
    const a = document.createElement("a");
    a.href = result.fileUrl;
    a.download = result.fileName;
    a.click();
    onToast?.("已开始下载证书文件（演示）");
  };

  return (
    <Drawer open={open} title="核验详情" onClose={onClose} width={520}>
      <div className="c-cert-detail">
        <div className="c-cert-detail__preview">
          <div className="c-cert-detail__frame">
            <img src={result.fileUrl} alt={result.fileName} />
          </div>
          <div className="c-cert-detail__file">
            <span className="c-cert-detail__file-name" title={result.fileName}>
              {result.fileName}
            </span>
            <button
              type="button"
              className="c-cert-detail__icon-btn"
              title="下载证书"
              aria-label="下载证书"
              onClick={downloadFile}
            >
              <DownloadIcon />
            </button>
          </div>
        </div>

        <div className="c-cert-detail__section-bar">核验结果</div>
        <div className={`c-cert-detail__status${ok ? "" : " is-fail"}`}>
          {ok ? <ShieldOkIcon /> : <ShieldFailIcon />}
          <div className="c-cert-detail__status-text">
            <div className="c-cert-detail__status-title">
              {ok ? "核验通过" : "核验不通过"}
            </div>
            {ok ? (
              <span className="c-cert-detail__badge is-ok">核验通过</span>
            ) : (
              <VerifyFailReasons reasons={failReasons} />
            )}
          </div>
        </div>

        <dl className="c-cert-detail__meta">
          <div className="c-cert-detail__row">
            <dt>核验编码</dt>
            <dd>
              <span>{result.verifyCode}</span>
              <button
                type="button"
                className="c-cert-detail__icon-btn"
                title="复制核验编码"
                aria-label="复制核验编码"
                onClick={() => void copyCode()}
              >
                <CopyIcon />
              </button>
            </dd>
          </div>
          <div className="c-cert-detail__row">
            <dt>核验人</dt>
            <dd>{result.verifier}</dd>
          </div>
          <div className="c-cert-detail__row">
            <dt>核验时间</dt>
            <dd>{result.verifiedAt}</dd>
          </div>
        </dl>

        <div className="c-cert-detail__section-bar">识别结果</div>
        <dl className="c-cert-detail__meta">
          {CERT_RECOGNITION_FIELDS.map((f) => (
            <div key={f.key} className="c-cert-detail__row">
              <dt>{f.label}</dt>
              <dd>{rec[f.key] || "—"}</dd>
            </div>
          ))}
        </dl>

        <p className="c-cert-detail__disclaimer">
          ※
          核验结果补充免责声明：本次服务提供的核验结果基于当前数据生成，可能存在滞后，仅供初步参考。关于作品/软件版权权属或登记状态的最终确认，请以您办理的中国版权保护中心著作权登记查询业务出具的官方查询结果为准。
        </p>
        <p className="c-cert-detail__source">数据来源：中国版权保护中心官方数据</p>
      </div>
    </Drawer>
  );
}
