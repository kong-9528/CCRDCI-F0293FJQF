import type { ReactNode } from "react";
import { ContractFileList } from "@/components/ContractFileList";
import { MaskedPhone } from "@/components/MaskedPhone";
import {
  AUDIT_HISTORY_STATUS_LABEL,
  getAuditHistoryByApplicationId,
  type AuditHistoryRecord,
  type AuditHistoryStatus,
} from "@/lib/auditHistoryStore";

type Props = {
  open: boolean;
  applicationId: string;
  canDownloadContract: boolean;
  onClose: () => void;
};

function resultText(record: AuditHistoryRecord) {
  const label = AUDIT_HISTORY_STATUS_LABEL[record.status as AuditHistoryStatus];
  if (record.status === "rejected" && record.rejectReason) {
    return `${label}（${record.rejectReason}）`;
  }
  return label;
}

function Field({ label, children, full }: { label: string; children: ReactNode; full?: boolean }) {
  return (
    <div className={`o-audit-hist-field${full ? " o-audit-hist-field--full" : ""}`}>
      <span className="o-audit-hist-field__label">{label}：</span>
      <span className="o-audit-hist-field__value">{children}</span>
    </div>
  );
}

function HistoryCard({
  record,
  index,
  total,
  canDownloadContract,
}: {
  record: AuditHistoryRecord;
  index: number;
  total: number;
  canDownloadContract: boolean;
}) {
  const seq = total - index;
  const reject = record.status === "rejected";

  return (
    <article className="o-audit-hist-card">
      <header className="o-audit-hist-card__head">
        第 {seq} 次 · 申请时间：{record.submittedAt}
      </header>

      <section className="o-audit-hist-section">
        <h4 className="o-audit-hist-section__title">申请信息</h4>
        <div className="o-audit-hist-grid">
          <Field label="机构名称">{record.companyName}</Field>
          <Field label="组织机构代码">{record.creditCode || "—"}</Field>
          <Field label="机构地址" full>
            {record.address || "—"}
          </Field>
          <Field label="合作领域" full>
            {record.cooperationField || "—"}
          </Field>
          <Field label="合同开始日期">{record.contractStart || "—"}</Field>
          <Field label="合同结束日期">{record.contractEnd || "—"}</Field>
          <Field label="合同附件" full>
            {record.contractFiles.length ? (
              <ContractFileList files={record.contractFiles} canDownload={canDownloadContract} />
            ) : (
              "—"
            )}
          </Field>
          <Field label="联系人">{record.contactName}</Field>
          <Field label="手机号">
            <MaskedPhone phone={record.contactPhone} />
          </Field>
          <Field label="申请账号">{record.account}</Field>
        </div>
      </section>

      <section className="o-audit-hist-section">
        <h4 className="o-audit-hist-section__title">审核信息</h4>
        <div className="o-audit-hist-grid">
          <Field label="审核结果" full>
            <span className={reject ? "o-audit-hist-reject" : undefined}>{resultText(record)}</span>
          </Field>
          <Field label="审核人">{record.reviewer || "—"}</Field>
          <Field label="审核时间">{record.reviewedAt || "—"}</Field>
        </div>
      </section>
    </article>
  );
}

export function AuditHistoryModal({ open, applicationId, canDownloadContract, onClose }: Props) {
  if (!open) return null;

  const records = getAuditHistoryByApplicationId(applicationId);

  return (
    <div className="a-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="a-modal a-modal--lg o-audit-hist-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="audit-history-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="a-modal__head">
          <h3 id="audit-history-title" className="a-modal__title">
            审核记录
          </h3>
          <button type="button" className="a-modal__close" aria-label="关闭" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="a-modal__body o-audit-hist-modal__body">
          {records.length === 0 ? (
            <div className="a-empty">暂无审核记录</div>
          ) : (
            <div className="o-audit-hist-list">
              {records.map((record, index) => (
                <HistoryCard
                  key={record.id}
                  record={record}
                  index={index}
                  total={records.length}
                  canDownloadContract={canDownloadContract}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
