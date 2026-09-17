import type { ReactNode } from "react";
import { ContractFileList } from "@/components/ContractFileList";
import { MaskedPhone } from "@/components/MaskedPhone";
import {
  AUDIT_HISTORY_STATUS_LABEL,
  type AuditHistoryRecord,
  type AuditHistoryStatus,
} from "@/lib/auditHistoryStore";

function resultText(record: AuditHistoryRecord) {
  const label = AUDIT_HISTORY_STATUS_LABEL[record.status as AuditHistoryStatus];
  if (record.status === "rejected" && record.rejectReason) {
    return `${label}（${record.rejectReason}）`;
  }
  return label;
}

export function AuditHistoryField({
  label,
  children,
  full,
}: {
  label: string;
  children: ReactNode;
  full?: boolean;
}) {
  return (
    <div className={`o-audit-hist-field${full ? " o-audit-hist-field--full" : ""}`}>
      <span className="o-audit-hist-field__label">{label}：</span>
      <span className="o-audit-hist-field__value">{children}</span>
    </div>
  );
}

type CardProps = {
  record: AuditHistoryRecord;
  /** 展示序号：第 N 次（通常为倒序中的总次数 - index） */
  seq: number;
  canDownloadContract: boolean;
};

/** 单次申请记录卡片（申请信息 + 审核信息），样式与审核记录弹窗一致 */
export function AuditHistoryRecordCard({ record, seq, canDownloadContract }: CardProps) {
  const reject = record.status === "rejected";

  return (
    <article className="o-audit-hist-card">
      <header className="o-audit-hist-card__head">
        第 {seq} 次 · 申请时间：{record.submittedAt}
      </header>

      <section className="o-audit-hist-section">
        <h4 className="o-audit-hist-section__title">申请信息</h4>
        <div className="o-audit-hist-grid">
          <AuditHistoryField label="机构名称">{record.companyName}</AuditHistoryField>
          <AuditHistoryField label="组织机构代码">{record.creditCode || "—"}</AuditHistoryField>
          <AuditHistoryField label="机构地址" full>
            {record.address || "—"}
          </AuditHistoryField>
          <AuditHistoryField label="合作领域" full>
            {record.cooperationField || "—"}
          </AuditHistoryField>
          <AuditHistoryField label="合同开始日期">{record.contractStart || "—"}</AuditHistoryField>
          <AuditHistoryField label="合同结束日期">{record.contractEnd || "—"}</AuditHistoryField>
          <AuditHistoryField label="合同附件" full>
            {record.contractFiles.length ? (
              <ContractFileList files={record.contractFiles} canDownload={canDownloadContract} />
            ) : (
              "—"
            )}
          </AuditHistoryField>
          <AuditHistoryField label="联系人">{record.contactName}</AuditHistoryField>
          <AuditHistoryField label="手机号">
            <MaskedPhone phone={record.contactPhone} />
          </AuditHistoryField>
          <AuditHistoryField label="申请账号">{record.account}</AuditHistoryField>
        </div>
      </section>

      <section className="o-audit-hist-section">
        <h4 className="o-audit-hist-section__title">审核信息</h4>
        <div className="o-audit-hist-grid">
          <AuditHistoryField label="审核结果" full>
            <span className={reject ? "o-audit-hist-reject" : undefined}>{resultText(record)}</span>
          </AuditHistoryField>
          <AuditHistoryField label="审核人">{record.reviewer || "—"}</AuditHistoryField>
          <AuditHistoryField label="审核时间">{record.reviewedAt || "—"}</AuditHistoryField>
        </div>
      </section>
    </article>
  );
}
