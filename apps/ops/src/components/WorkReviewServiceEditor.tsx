import { useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { TableAction } from "@/components/TableAction";
import { IconDisable, IconEnable, IconTrash } from "@/components/icons/UiIcons";
import {
  SERVICE_STATUS_LABEL,
  deriveServiceStatus,
} from "@/lib/catalog";
import {
  emptyAuditServiceRow,
  type AuditServiceFormRow,
} from "@/lib/productConfig";

type Props = {
  value: AuditServiceFormRow | null;
  onChange: (value: AuditServiceFormRow | null) => void;
  defaultRange?: { startDate: string; endDate: string };
  showUsed?: boolean;
  showStatus?: boolean;
  mode?: "create" | "edit";
};

function statusTagClass(status: keyof typeof SERVICE_STATUS_LABEL) {
  if (status === "active") return "a-tag--ok";
  if (status === "pending") return "a-tag--wn";
  if (status === "stopped") return "a-tag--er";
  if (status === "over_quota") return "a-tag--wn";
  return "a-tag--muted";
}

export function WorkReviewServiceEditor({
  value,
  onChange,
  defaultRange,
  showUsed = true,
  showStatus = false,
  mode = "create",
}: Props) {
  const isEdit = mode === "edit";
  const [pendingToggle, setPendingToggle] = useState<"stop" | "resume" | null>(null);

  if (!value) {
    return (
      <div className="a-stack a-audit-service-editor">
        <div className="a-empty" style={{ padding: "28px 16px" }}>
          尚未开通作品智能辅助审核
          <div style={{ marginTop: 12 }}>
            <button
              type="button"
              className="a-btn a-btn--sm a-btn--primary"
              onClick={() =>
                onChange(
                  emptyAuditServiceRow({
                    startDate: defaultRange?.startDate,
                    endDate: defaultRange?.endDate,
                  }),
                )
              }
            >
              开通服务
            </button>
          </div>
        </div>
      </div>
    );
  }

  const locked = isEdit && !value.isNew;
  const quotaTotalNum = value.quotaTotal.trim() ? Number(value.quotaTotal) : null;
  const status = value.isNew
    ? null
    : deriveServiceStatus({
        product: "workReview",
        stopped: value.stopped,
        startDate: value.startDate,
        endDate: value.endDate,
        quotaType: "total",
        quotaTotal: Number.isFinite(quotaTotalNum) ? quotaTotalNum : null,
        usedCount: value.usedCount,
      });

  return (
    <div className="a-stack a-audit-service-editor">
      <section className="a-service-package a-audit-service-card">
        <header className="a-service-package__head">
          <div className="a-service-package__title-row">
            <label className="a-field a-field--inline a-service-package__quota">
              <span className="a-field__label">授权总量</span>
              <input
                className="a-input a-input--sm"
                style={{ width: 110 }}
                inputMode="numeric"
                placeholder="次数"
                value={value.quotaTotal}
                onChange={(e) =>
                  onChange({
                    ...value,
                    quotaTotal: e.target.value.replace(/\D/g, ""),
                  })
                }
              />
            </label>

            {showUsed ? (
              <div className="a-field a-field--inline">
                <span className="a-field__label">已用</span>
                <span className="a-service-package__used">
                  {value.isNew ? "—" : value.usedCount.toLocaleString()}
                </span>
              </div>
            ) : null}

            <label className="a-field a-field--inline a-service-package__period">
              <span className="a-field__label">生效起止</span>
              <div className="a-date-range">
                <input
                  type="date"
                  className="a-input"
                  value={value.startDate}
                  onChange={(e) => onChange({ ...value, startDate: e.target.value })}
                />
                <span>至</span>
                <input
                  type="date"
                  className="a-input"
                  value={value.endDate}
                  onChange={(e) => onChange({ ...value, endDate: e.target.value })}
                />
              </div>
            </label>

            {showStatus ? (
              <div className="a-field a-field--inline">
                <span className="a-field__label">状态</span>
                {status == null ? (
                  <span className="a-service-package__placeholder">—</span>
                ) : (
                  <span className={`a-tag ${statusTagClass(status)}`}>
                    {SERVICE_STATUS_LABEL[status]}
                  </span>
                )}
              </div>
            ) : null}

            <div className="a-service-package__title-actions a-actions a-actions--nowrap">
              {locked ? (
                <TableAction
                  icon={value.stopped ? <IconEnable /> : <IconDisable />}
                  onClick={() => setPendingToggle(value.stopped ? "resume" : "stop")}
                >
                  {value.stopped ? "恢复" : "停止"}
                </TableAction>
              ) : null}
              {!locked || value.isNew ? (
                <TableAction
                  icon={<IconTrash />}
                  danger
                  onClick={() => onChange(null)}
                >
                  移除
                </TableAction>
              ) : null}
            </div>
          </div>
        </header>
      </section>

      <ConfirmDialog
        open={Boolean(pendingToggle)}
        title={pendingToggle === "stop" ? "确认停止服务" : "确认恢复服务"}
        description={
          pendingToggle === "stop"
            ? "确定停止「作品智能辅助审核」吗？停止后将不可调用，已用额度仍会保留。"
            : "确定恢复「作品智能辅助审核」吗？恢复后，在生效期内可继续使用（允许超额）。"
        }
        confirmText={pendingToggle === "stop" ? "停止" : "恢复"}
        danger={pendingToggle === "stop"}
        onCancel={() => setPendingToggle(null)}
        onConfirm={() => {
          if (!pendingToggle) return;
          onChange({ ...value, stopped: pendingToggle === "stop" });
          setPendingToggle(null);
        }}
      />
    </div>
  );
}
