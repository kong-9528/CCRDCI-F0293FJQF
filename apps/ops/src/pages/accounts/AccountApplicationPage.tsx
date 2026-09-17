import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { AccountProductConfigPanel } from "@/components/AccountProductConfigPanel";
import { AuditHistoryModal } from "@/components/AuditHistoryModal";
import { ContractFileList } from "@/components/ContractFileList";
import { IconBack, IconHistory } from "@/components/icons/UiIcons";
import { MaskedPhone } from "@/components/MaskedPhone";
import {
  APPLICATION_STATUS_LABEL,
  useAccountsStore,
  type ApplicationStatus,
} from "@/lib/accountsStore";
import {
  defaultProductConfigForApplication,
  emptyProductConfig,
  type ProductConfigState,
} from "@/lib/productConfig";
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

export function AccountApplicationPage({ mode }: Props) {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { getApplicationById, approveApplication, rejectApplication } = useAccountsStore();
  const application = getApplicationById(id);

  const [decision, setDecision] = useState<ReviewDecision>("approve");
  const [productConfig, setProductConfig] = useState<ProductConfigState>(() => emptyProductConfig());
  const [rejectReason, setRejectReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    if (!application) return;
    setDecision("approve");
    setProductConfig(defaultProductConfigForApplication(application));
    setRejectReason("");
    setError(null);
    setHistoryOpen(false);
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
  const pageTitle = mode === "review" ? "审核开通申请" : "申请详情";
  const userPerms = getCurrentUserPermissions();
  const meName = getCurrentUser()?.displayName ?? "";
  const listBackPath =
    application.status === "pending"
      ? "/accounts/pending"
      : application.reviewer === meName
        ? "/accounts/mine"
        : "/accounts/all";
  const contractDownloadPerm =
    mode === "review" ? "accounts.review.contractDownload" : "accounts.detail.contractDownload";
  const canDownloadContract = hasAccountsPerm(userPerms, contractDownloadPerm);

  const submit = () => {
    setError(null);
    if (decision === "reject") {
      const result = rejectApplication(application.id, rejectReason);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      navigate(`/accounts/${application.id}`, { replace: true });
      return;
    }
    const result = approveApplication(application.id, productConfig);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate(`/accounts/${application.id}`, { replace: true });
  };

  return (
    <div className="a-stack o-app-review">
      <div className="o-app-review__toolbar">
        <button type="button" className="a-btn a-btn--sm o-app-review__back" onClick={() => navigate(listBackPath)}>
          <IconBack size={14} />
          返回
        </button>
        <h1 className="o-app-review__title">
          {pageTitle}
          {readOnly && application.status === "approved" && application.customerId ? (
            <Link
              to={`/accounts/${application.id}/edit`}
              className="a-btn a-btn--sm a-btn--primary"
              style={{ marginLeft: 12 }}
            >
              编辑产品服务
            </Link>
          ) : null}
        </h1>
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
          {!readOnly ? (
            <>
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

              {decision === "approve" ? (
                <div className="a-stack">
                  <div className="a-field__hint">
                    审核通过后将创建机构账号。产品配置为可选项：可在此开通产品，也可通过后在「编辑产品服务」中配置。
                  </div>
                  <AccountProductConfigPanel
                    value={productConfig}
                    onChange={setProductConfig}
                    defaultRange={{
                      startDate: application.contractStart,
                      endDate: application.contractEnd,
                    }}
                    mode="create"
                  />
                </div>
              ) : (
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
              )}

              {error ? <div className="a-form-error">{error}</div> : null}

              <div className="o-app-review__actions">
                <button type="button" className="a-btn a-btn--primary" onClick={submit}>
                  确定
                </button>
                <button type="button" className="a-btn" onClick={() => navigate(listBackPath)}>
                  关闭
                </button>
              </div>
            </>
          ) : (
            <div className="a-desc o-app-review-desc">
              <div className="a-desc__item">
                <span className="a-desc__label">审核结果</span>
                <span className="a-desc__value">{statusTag(application.status)}</span>
              </div>
              <div className="a-desc__item">
                <span className="a-desc__label">审核人</span>
                <span className="a-desc__value">{application.reviewer ?? "—"}</span>
              </div>
              <div className="a-desc__item">
                <span className="a-desc__label">审核时间</span>
                <span className="a-desc__value">{application.reviewedAt ?? "—"}</span>
              </div>
              {application.rejectReason ? (
                <div className="a-desc__item a-desc__item--wide">
                  <span className="a-desc__label">不通过原因</span>
                  <span className="a-desc__value o-audit-hist-reject">{application.rejectReason}</span>
                </div>
              ) : null}
            </div>
          )}
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
