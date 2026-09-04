import { Drawer } from "@/components/Drawer";
import {
  CopyIcon,
  ShieldFailIcon,
  ShieldOkIcon,
} from "@/components/usage/VerifyDetailShared";
import {
  REVIEW_STATUS_LABEL,
  copyText,
  type ReviewUsageRecord,
} from "@/lib/usageRecordsStore";

type Props = {
  open: boolean;
  record: ReviewUsageRecord | null;
  onClose: () => void;
  onToast?: (msg: string) => void;
};

export function ReviewUsageDetailDrawer({ open, record, onClose, onToast }: Props) {
  if (!record) return null;

  const ok = record.status === "success";
  const reviewing = record.status === "reviewing";

  const copyTaskId = async () => {
    const done = await copyText(record.taskId);
    onToast?.(done ? "流水号已复制" : "复制失败，请手动选择复制");
  };

  return (
    <Drawer open={open} title="审核详情" onClose={onClose} width={520}>
      <div className="c-cert-detail">
        <div className="c-cert-detail__section-bar">审核结果</div>
        <div
          className={`c-cert-detail__status${ok || reviewing ? "" : " is-fail"}`}
        >
          {ok || reviewing ? (
            <ShieldOkIcon gradId="opsReviewShieldOk" />
          ) : (
            <ShieldFailIcon gradId="opsReviewShieldFail" />
          )}
          <div className="c-cert-detail__status-text">
            <div className="c-cert-detail__status-title">
              {reviewing
                ? "任务仍在审核中"
                : ok
                  ? "审核成功"
                  : "审核失败"}
            </div>
            <span
              className={`c-cert-detail__badge${
                ok ? " is-ok" : reviewing ? "" : " is-er"
              }`}
              style={
                reviewing
                  ? { color: "#0b62b8", background: "#e8f1fb" }
                  : undefined
              }
            >
              {REVIEW_STATUS_LABEL[record.status]}
            </span>
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
            <dt>流水号</dt>
            <dd>
              <span>{record.taskId}</span>
              <button
                type="button"
                className="c-cert-detail__icon-btn"
                title="复制流水号"
                aria-label="复制流水号"
                onClick={() => void copyTaskId()}
              >
                <CopyIcon />
              </button>
            </dd>
          </div>
          <div className="c-cert-detail__row">
            <dt>审核类型</dt>
            <dd>{record.apiName}</dd>
          </div>
          <div className="c-cert-detail__row">
            <dt>提交时间</dt>
            <dd>{record.submittedAt}</dd>
          </div>
          <div className="c-cert-detail__row">
            <dt>完成时间</dt>
            <dd>{record.finishedAt ?? "—"}</dd>
          </div>
        </dl>

        <div className="c-cert-detail__section-bar">结果说明</div>
        <dl className="c-cert-detail__meta">
          <div className="c-cert-detail__row">
            <dt>结论摘要</dt>
            <dd>{record.resultSummary}</dd>
          </div>
        </dl>
      </div>
    </Drawer>
  );
}
