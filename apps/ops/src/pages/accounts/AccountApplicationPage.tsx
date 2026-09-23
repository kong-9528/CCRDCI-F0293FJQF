import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AuditHistoryModal } from "@/components/AuditHistoryModal";
import { AuditHistoryField, AuditHistoryRecordCard } from "@/components/AuditHistoryRecordCard";
import { ContractFileList } from "@/components/ContractFileList";
import { ProductVerifyOptions } from "@/components/ProductVerifyOptions";
import { IconBack, IconHistory } from "@/components/icons/UiIcons";
import { MaskedPhone } from "@/components/MaskedPhone";
import {
  APPLICATION_STATUS_LABEL,
  useAccountsStore,
  type AccountApplication,
  type ApplicationStatus,
} from "@/lib/accountsStore";
import {
  getAuditHistoryByApplicationId,
  type AuditHistoryRecord,
} from "@/lib/auditHistoryStore";
import {
  SERVICE_STATUS_LABEL,
  deriveServiceStatus,
  formatQuota,
  isVerifyProduct,
  productName,
  resolveAuditServicePackage,
  resolveServicePackages,
} from "@/lib/catalog";
import { getCustomerById } from "@/lib/customersStore";
import { emptyProductConfig } from "@/lib/productConfig";
import { getCurrentUser, getCurrentUserPermissions } from "@/lib/usersStore";

type ReviewDecision = "approve" | "reject";

function hasAccountsPerm(userPerms: string[], permId: string) {
  return userPerms.includes(permId) || userPerms.includes("accounts");
}

type Props = {
  mode: "review" | "view";
};

function statusTag(status: ApplicationStatus) {
  if (status === "approved") return <span className="a-tag a-tag--ok">{APPLICATION_STATUS_LABEL[status]}</span>;
  if (status === "rejected") return <span className="a-tag a-tag--er">{APPLICATION_STATUS_LABEL[status]}</span>;
  return <span className="a-tag a-tag--wn">{APPLICATION_STATUS_LABEL[status]}</span>;
}

function applicationAsHistoryRecord(app: AccountApplication): AuditHistoryRecord {
  return {
    id: `fallback-${app.id}`,
    applicationId: app.id,
    submittedAt: app.submittedAt,
    status: app.status === "approved" ? "approved" : app.status === "rejected" ? "rejected" : "pending",
    companyName: app.companyName,
    creditCode: app.creditCode,
    address: app.address,
    cooperationField: app.cooperationField || "",
    contractStart: app.contractStart,
    contractEnd: app.contractEnd,
    contractFiles: [...app.contractFiles],
    contactName: app.contactName,
    contactPhone: app.contactPhone,
    account: app.account,
    reviewedAt: app.reviewedAt,
    reviewer: app.reviewer,
    rejectReason: app.rejectReason,
  };
}

function resolveBackPath(
  from: string | null,
  application: AccountApplication,
  meName: string,
) {
  if (from === "mine") return "/accounts/mine";
  if (from === "all") return "/accounts/all";
  if (from === "pending") return "/accounts/pending";
  if (application.status === "pending") return "/accounts/pending";
  return application.reviewer === meName ? "/accounts/mine" : "/accounts/all";
}

function ApprovedServicesSection({ customerId }: { customerId?: string }) {
  const customer = customerId ? getCustomerById(customerId) : undefined;
  if (!customer) {
    return <div className="a-empty">暂无开通的技术服务</div>;
  }

  const packages = resolveServicePackages(customer);
  const audit = resolveAuditServicePackage(customer);

  if (packages.length === 0 && !audit) {
    return <div className="a-empty">暂无开通的技术服务</div>;
  }

  return (
    <div className="o-app-detail-services a-stack">
      {packages.map((pkg) => {
        const unitStatus = deriveServiceStatus({
          stopped: false,
          startDate: pkg.startDate,
          endDate: pkg.endDate,
          quotaType: pkg.quotaType,
          quotaTotal: pkg.quotaTotal,
          usedCount: pkg.usedCount,
        });
        return (
          <div key={pkg.id} className="o-app-detail-svc-block">
            <div className="o-app-detail-svc-block__meta">
              <strong>版权核验服务</strong>
              <span>{formatQuota(pkg)}</span>
              <span>
                {pkg.startDate} ~ {pkg.endDate}
              </span>
              <span className="a-tag a-tag--muted">{SERVICE_STATUS_LABEL[unitStatus]}</span>
            </div>
            {pkg.services.length === 0 ? (
              <div className="a-field__hint">暂无核验产品</div>
            ) : (
              <table className="a-table a-table--compact">
                <thead>
                  <tr>
                    <th>核验产品</th>
                    <th>开通明细</th>
                    <th>每作品消耗</th>
                    <th>状态</th>
                  </tr>
                </thead>
                <tbody>
                  {pkg.services.map((svc) => {
                    const stopped = Boolean(svc.stopped);
                    const status = deriveServiceStatus({
                      product: svc.product,
                      stopped,
                      startDate: pkg.startDate,
                      endDate: pkg.endDate,
                      quotaType: pkg.quotaType,
                      quotaTotal: pkg.quotaTotal,
                      usedCount: pkg.usedCount,
                    });
                    return (
                      <tr key={svc.product}>
                        <td>{productName(svc.product)}</td>
                        <td>
                          {isVerifyProduct(svc.product) ? (
                            <ProductVerifyOptions
                              readonly
                              businessTypes={svc.businessTypes ?? []}
                              usageChannels={svc.usageChannels ?? []}
                            />
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>
                          {typeof svc.consumePerWork === "number" && svc.consumePerWork > 0
                            ? svc.consumePerWork
                            : 1}
                          次
                        </td>
                        <td>
                          <span className="a-tag a-tag--muted">
                            {SERVICE_STATUS_LABEL[status]}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        );
      })}

      {audit ? (
        <div className="o-app-detail-svc-block">
          <div className="o-app-detail-svc-block__meta">
            <strong>作品智能辅助审核</strong>
            <span>{formatQuota(audit)}</span>
            <span>
              {audit.startDate} ~ {audit.endDate}
            </span>
            <span className="a-tag a-tag--muted">
              {SERVICE_STATUS_LABEL[deriveServiceStatus({ ...audit, product: "workReview" })]}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function AccountApplicationPage({ mode }: Props) {
  const { id = "" } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getApplicationById, approveApplication, rejectApplication } = useAccountsStore();
  const application = getApplicationById(id);

  const [decision, setDecision] = useState<ReviewDecision>("approve");
  const [rejectReason, setRejectReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    if (!application) return;
    setDecision("approve");
    setRejectReason("");
    setError(null);
    setHistoryOpen(false);
  }, [application]);

  const historyRecords = useMemo(() => {
    if (!application) return [];
    const list = getAuditHistoryByApplicationId(application.id);
    if (list.length > 0) return list;
    return [applicationAsHistoryRecord(application)];
  }, [application]);

  if (!application) {
    return (
      <div className="a-card">
        <div className="a-card__head">申请详情</div>
        <div className="a-card__body">
          <div className="a-empty">未找到该申请记录</div>
        </div>
      </div>
    );
  }

  if (mode === "review" && application.status !== "pending") {
    return <Navigate to={`/accounts/${application.id}`} replace />;
  }

  if (mode === "view" && application.status === "pending") {
    return <Navigate to={`/accounts/${application.id}/review`} replace />;
  }

  const readOnly = mode === "view";
  const userPerms = getCurrentUserPermissions();
  const meName = getCurrentUser()?.displayName ?? "";
  const from = searchParams.get("from");
  const listBackPath = resolveBackPath(from, application, meName);
  const contractDownloadPerm =
    mode === "review" ? "accounts.review.contractDownload" : "accounts.detail.contractDownload";
  const canDownloadContract = hasAccountsPerm(userPerms, contractDownloadPerm);

  const pageTitle =
    mode === "review"
      ? "审核开通申请"
      : application.status === "rejected"
        ? `申请记录 · ${application.companyName}`
        : `申请详情 · ${application.companyName}`;

  const submit = () => {
    setError(null);
    if (decision === "reject") {
      const result = rejectApplication(application.id, rejectReason);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      navigate(`/accounts/${application.id}?from=${from === "all" ? "all" : "mine"}`, {
        replace: true,
      });
      return;
    }
    const result = approveApplication(application.id, emptyProductConfig());
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate(`/accounts/${application.id}?from=${from === "all" ? "all" : "mine"}`, {
      replace: true,
    });
  };

  /* ---------- 不通过：整页展示申请记录（可多条） ---------- */
  if (readOnly && application.status === "rejected") {
    return (
      <div className="a-stack o-app-review">
        <div className="o-app-review__toolbar">
          <button
            type="button"
            className="a-btn a-btn--sm o-app-review__back"
            onClick={() => navigate(listBackPath)}
          >
            <IconBack size={14} />
            返回
          </button>
          <h1 className="o-app-review__title">
            {pageTitle}
            {statusTag(application.status)}
          </h1>
        </div>

        <div className="a-card o-app-detail-page">
          <div className="a-card__body o-audit-hist-list">
            {historyRecords.map((record, index) => (
              <AuditHistoryRecordCard
                key={record.id}
                record={record}
                seq={historyRecords.length - index}
                canDownloadContract={canDownloadContract}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ---------- 已通过：基本信息 + 开通的技术服务 ---------- */
  if (readOnly && application.status === "approved") {
    return (
      <div className="a-stack o-app-review">
        <div className="o-app-review__toolbar">
          <button
            type="button"
            className="a-btn a-btn--sm o-app-review__back"
            onClick={() => navigate(listBackPath)}
          >
            <IconBack size={14} />
            返回
          </button>
          <h1 className="o-app-review__title">
            {pageTitle}
            {statusTag(application.status)}
            {application.customerId && from !== "all" ? (
              <Link
                to={`/accounts/${application.id}/edit?from=${from === "mine" ? "mine" : "detail"}`}
                className="a-btn a-btn--sm a-btn--primary"
                style={{ marginLeft: 12 }}
              >
                配置技术服务
              </Link>
            ) : null}
          </h1>
        </div>

        <div className="a-card o-app-detail-page">
          <div className="a-card__body a-stack" style={{ gap: 20 }}>
            <section className="o-audit-hist-section">
              <h4 className="o-audit-hist-section__title">基本信息</h4>
              <div className="o-audit-hist-grid">
                <AuditHistoryField label="机构名称">{application.companyName}</AuditHistoryField>
                <AuditHistoryField label="组织机构代码">
                  {application.creditCode || "—"}
                </AuditHistoryField>
                <AuditHistoryField label="机构地址" full>
                  {application.address || "—"}
                </AuditHistoryField>
                <AuditHistoryField label="合作领域" full>
                  {application.cooperationField || "—"}
                </AuditHistoryField>
                <AuditHistoryField label="合同开始日期">
                  {application.contractStart || "—"}
                </AuditHistoryField>
                <AuditHistoryField label="合同结束日期">
                  {application.contractEnd || "—"}
                </AuditHistoryField>
                <AuditHistoryField label="合同附件" full>
                  {application.contractFiles.length ? (
                    <ContractFileList
                      files={application.contractFiles}
                      canDownload={canDownloadContract}
                    />
                  ) : (
                    "—"
                  )}
                </AuditHistoryField>
                <AuditHistoryField label="联系人">{application.contactName}</AuditHistoryField>
                <AuditHistoryField label="手机号">
                  <MaskedPhone phone={application.contactPhone} />
                </AuditHistoryField>
                <AuditHistoryField label="申请账号">{application.account}</AuditHistoryField>
                <AuditHistoryField label="申请时间">{application.submittedAt}</AuditHistoryField>
                <AuditHistoryField label="审核人">{application.reviewer ?? "—"}</AuditHistoryField>
                <AuditHistoryField label="审核时间">{application.reviewedAt ?? "—"}</AuditHistoryField>
              </div>
            </section>

            <section className="o-audit-hist-section">
              <h4 className="o-audit-hist-section__title">开通的技术服务</h4>
              <ApprovedServicesSection customerId={application.customerId} />
            </section>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- 审核页（待审核） ---------- */
  return (
    <div className="a-stack o-app-review">
      <div className="o-app-review__toolbar">
        <button
          type="button"
          className="a-btn a-btn--sm o-app-review__back"
          onClick={() => navigate(listBackPath)}
        >
          <IconBack size={14} />
          返回
        </button>
        <h1 className="o-app-review__title">{pageTitle}</h1>
      </div>

      <section className="a-card o-app-review-panel">
        <div className="o-app-review-panel__head">申请信息</div>
        <div className="a-card__body">
          <div className="a-desc o-app-review-desc">
            <div className="a-desc__item">
              <span className="a-desc__label">机构名称</span>
              <span className="a-desc__value">{application.companyName}</span>
            </div>
            <div className="a-desc__item">
              <span className="a-desc__label">组织机构代码</span>
              <span className="a-desc__value">{application.creditCode || "—"}</span>
            </div>
            <div className="a-desc__item a-desc__item--wide">
              <span className="a-desc__label">机构地址</span>
              <span className="a-desc__value">{application.address || "—"}</span>
            </div>
            <div className="a-desc__item a-desc__item--wide">
              <span className="a-desc__label">合作领域</span>
              <span className="a-desc__value">{application.cooperationField || "—"}</span>
            </div>
            <div className="a-desc__item">
              <span className="a-desc__label">合同开始日期</span>
              <span className="a-desc__value">{application.contractStart || "—"}</span>
            </div>
            <div className="a-desc__item">
              <span className="a-desc__label">合同结束日期</span>
              <span className="a-desc__value">{application.contractEnd || "—"}</span>
            </div>
            <div className="a-desc__item a-desc__item--wide">
              <span className="a-desc__label">合同附件</span>
              <span className="a-desc__value">
                <ContractFileList
                  files={application.contractFiles}
                  canDownload={canDownloadContract}
                />
              </span>
            </div>
            <div className="a-desc__item">
              <span className="a-desc__label">联系人</span>
              <span className="a-desc__value">{application.contactName}</span>
            </div>
            <div className="a-desc__item">
              <span className="a-desc__label">手机号</span>
              <span className="a-desc__value">
                <MaskedPhone phone={application.contactPhone} />
              </span>
            </div>
            <div className="a-desc__item">
              <span className="a-desc__label">申请账号</span>
              <span className="a-desc__value">{application.account}</span>
            </div>
            <div className="a-desc__item">
              <span className="a-desc__label">申请时间</span>
              <span className="a-desc__value">{application.submittedAt}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="a-card o-app-review-panel">
        <div className="o-app-review-panel__head">
          <span>审核</span>
          <button
            type="button"
            className="o-app-review-panel__link"
            onClick={() => setHistoryOpen(true)}
          >
            <IconHistory size={14} />
            审核记录
          </button>
        </div>
        <div className="a-card__body a-stack">
          <div className="a-field a-field--stack">
            <span className="a-field__label">
              审核结果 <span className="a-req">*</span>
            </span>
            <div className="a-inline-actions">
              <label className="a-radio">
                <input
                  type="radio"
                  name="reviewDecision"
                  checked={decision === "approve"}
                  onChange={() => {
                    setDecision("approve");
                    setError(null);
                  }}
                />
                审核通过
              </label>
              <label className="a-radio">
                <input
                  type="radio"
                  name="reviewDecision"
                  checked={decision === "reject"}
                  onChange={() => {
                    setDecision("reject");
                    setError(null);
                  }}
                />
                不通过
              </label>
            </div>
          </div>

          {decision === "reject" ? (
            <div className="a-field a-field--stack">
              <span className="a-field__label">
                不通过原因 <span className="a-req">*</span>
              </span>
              <textarea
                className="a-textarea"
                rows={4}
                placeholder="请输入不通过原因"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          ) : null}

          {error ? <div className="a-form-error">{error}</div> : null}

          <div className="o-app-review__actions">
            <button type="button" className="a-btn a-btn--primary" onClick={submit}>
              确定
            </button>
            <button type="button" className="a-btn" onClick={() => navigate(listBackPath)}>
              关闭
            </button>
          </div>
        </div>
      </section>

      <AuditHistoryModal
        open={historyOpen}
        applicationId={application.id}
        canDownloadContract={canDownloadContract}
        onClose={() => setHistoryOpen(false)}
      />
    </div>
  );
}
