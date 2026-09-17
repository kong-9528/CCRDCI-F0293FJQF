import { AuditHistoryRecordCard } from "@/components/AuditHistoryRecordCard";
import { getAuditHistoryByApplicationId } from "@/lib/auditHistoryStore";

type Props = {
  open: boolean;
  applicationId: string;
  canDownloadContract: boolean;
  onClose: () => void;
};

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
                <AuditHistoryRecordCard
                  key={record.id}
                  record={record}
                  seq={records.length - index}
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
