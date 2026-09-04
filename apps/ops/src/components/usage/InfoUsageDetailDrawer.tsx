import { Drawer } from "@/components/Drawer";
import {
  CopyIcon,
  DetailDisclaimer,
  ShieldFailIcon,
  ShieldOkIcon,
  VerifyFailReasons,
} from "@/components/usage/VerifyDetailShared";
import {
  INFO_WORK_TYPE_LABEL,
  copyText,
  formatInfoFailReasons,
  infoSubmittedFieldRows,
  type InfoUsageRecord,
} from "@/lib/usageRecordsStore";

type Props = {
  open: boolean;
  record: InfoUsageRecord | null;
  onClose: () => void;
  onToast?: (msg: string) => void;
};

export function InfoUsageDetailDrawer({ open, record, onClose, onToast }: Props) {
  if (!record) return null;

  const ok = record.detailStatus === "match";
  const failReasons = formatInfoFailReasons(record);
  const submittedRows = infoSubmittedFieldRows(record);

  const copyCode = async () => {
    const done = await copyText(record.verifyCode);
    onToast?.(done ? "核验编码已复制" : "复制失败，请手动选择复制");
  };

  return (
    <Drawer open={open} title="核验详情" onClose={onClose} width={520}>
      <div className="c-cert-detail">
        <div className="c-cert-detail__section-bar">核验结果</div>
        <div className={`c-cert-detail__status${ok ? "" : " is-fail"}`}>
          {ok ? (
            <ShieldOkIcon gradId="opsInfoShieldOk" />
          ) : (
            <ShieldFailIcon gradId="opsInfoShieldFail" />
          )}
          <div className="c-cert-detail__status-text">
            <div className="c-cert-detail__status-title">
              {ok ? "登记信息核验通过" : "登记信息核验未通过"}
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
            <dt>机构/企业名称</dt>
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
            <dt>核验时间</dt>
            <dd>{record.verifiedAt}</dd>
          </div>
          <div className="c-cert-detail__row">
            <dt>核验方式</dt>
            <dd>{record.channel}</dd>
          </div>
          <div className="c-cert-detail__row">
            <dt>类型</dt>
            <dd>{INFO_WORK_TYPE_LABEL[record.workType]}</dd>
          </div>
        </dl>

        <div className="c-cert-detail__section-bar">提交信息</div>
        <dl className="c-cert-detail__meta">
          {submittedRows.map((row) => (
            <div key={row.field} className="c-cert-detail__row">
              <dt>{row.label}</dt>
              <dd>{row.field === "regNo" ? <code>{row.value}</code> : row.value}</dd>
            </div>
          ))}
        </dl>

        <DetailDisclaimer />
      </div>
    </Drawer>
  );
}
