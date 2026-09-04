import { useEffect, useState } from "react";
import { Drawer } from "@/components/Drawer";
import {
  CopyIcon,
  DetailDisclaimer,
  DownloadIcon,
  ShieldFailIcon,
  ShieldOkIcon,
  VerifyFailReasons,
} from "@/components/usage/VerifyDetailShared";
import {
  copyText,
  formatCertFailReasons,
  type CertUsageRecord,
} from "@/lib/usageRecordsStore";

type Props = {
  open: boolean;
  record: CertUsageRecord | null;
  onClose: () => void;
  onToast?: (msg: string) => void;
};

export function CertUsageDetailDrawer({ open, record, onClose, onToast }: Props) {
  const [recogOpen, setRecogOpen] = useState(true);

  useEffect(() => {
    if (open) setRecogOpen(true);
  }, [open, record?.id]);

  if (!record) return null;

  const ok = record.status === "pass";
  const rec = record.recognition;
  const failReasons = formatCertFailReasons(record);

  const copyCode = async () => {
    const done = await copyText(record.verifyCode);
    onToast?.(done ? "核验编码已复制" : "复制失败，请手动选择复制");
  };

  const downloadFile = () => {
    const a = document.createElement("a");
    a.href = record.fileUrl;
    a.download = record.fileName;
    a.click();
    onToast?.("已开始下载证书文件（演示）");
  };

  return (
    <Drawer open={open} title="核验详情" onClose={onClose} width={520}>
      <div className="c-cert-detail">
        <div className="c-cert-detail__preview">
          <div className="c-cert-detail__frame">
            <img src={record.fileUrl} alt={record.fileName} />
          </div>
          <div className="c-cert-detail__file">
            <span className="c-cert-detail__file-name" title={record.fileName}>
              {record.fileName}
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
          {ok ? (
            <ShieldOkIcon gradId="opsCertShieldOk" />
          ) : (
            <ShieldFailIcon gradId="opsCertShieldFail" />
          )}
          <div className="c-cert-detail__status-text">
            <div className="c-cert-detail__status-title">
              {ok ? "证书信息核验通过" : "证书信息核验未通过"}
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
            <dt>客户账号</dt>
            <dd>
              <code>{record.account}</code>
            </dd>
          </div>
          <div className="c-cert-detail__row">
            <dt>机构名称</dt>
            <dd>{record.companyName}</dd>
          </div>
          <div className="c-cert-detail__row">
            <dt>核验编码</dt>
            <dd>
              <span>{record.verifyCode}</span>
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
            <dd>{record.verifier}</dd>
          </div>
          <div className="c-cert-detail__row">
            <dt>核验时间</dt>
            <dd>{record.verifiedAt}</dd>
          </div>
          <div className="c-cert-detail__row">
            <dt>核验方式</dt>
            <dd>{record.channel}</dd>
          </div>
        </dl>

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
          <dl className="c-cert-detail__meta">
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

        <DetailDisclaimer />
      </div>
    </Drawer>
  );
}
