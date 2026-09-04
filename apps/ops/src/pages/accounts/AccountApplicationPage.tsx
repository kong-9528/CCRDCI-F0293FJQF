import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { AccountProductConfigPanel } from "@/components/AccountProductConfigPanel";
import { ContractFileList } from "@/components/ContractFileList";
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

  useEffect(() => {
    if (!application) return;
    setDecision("approve");
    setProductConfig(defaultProductConfigForApplication(application));
    setRejectReason("");
    setError(null);
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
    <div className="a-stack">
      <div className="a-card">
        <div className="a-card__head">
          {pageTitle} · {application.companyName}
          <div className="a-card__extra a-inline-actions">
            {readOnly && application.status === "approved" && application.customerId ? (
              <Link
                to={`/accounts/${application.id}/edit`}
                className="a-btn a-btn--sm a-btn--primary"
              >
                编辑产品服务
              </Link>
            ) : null}
            <button type="button" className="a-btn a-btn--sm" onClick={() => navigate(listBackPath)}>
              返回列表
            </button>
          </div>
        </div>
        <div className="a-card__body a-stack">
          <p className="a-field__hint" style={{ margin: 0 }}>
            客户申请开通技术服务中心平台账号，请核对资料后处理。
          </p>

          <section className="a-form-section">
            <h3 className="a-form-section__title">申请状态</h3>
            <div className="a-desc">
              <div className="a-desc__item">
                <span className="a-desc__label">当前状态</span>
                <span className="a-desc__value">{statusTag(application.status)}</span>
              </div>
              <div className="a-desc__item">
                <span className="a-desc__label">提交时间</span>
                <span className="a-desc__value">{application.submittedAt}</span>
              </div>
              {application.reviewedAt ? (
                <>
                  <div className="a-desc__item">
                    <span className="a-desc__label">审核时间</span>
                    <span className="a-desc__value">{application.reviewedAt}</span>
                  </div>
                  <div className="a-desc__item">
                    <span className="a-desc__label">审核人</span>
                    <span className="a-desc__value">{application.reviewer ?? "—"}</span>
                  </div>
                </>
              ) : null}
              {application.rejectReason ? (
                <div className="a-desc__item a-desc__item--wide">
                  <span className="a-desc__label">拒绝原因</span>
                  <span className="a-desc__value">{application.rejectReason}</span>
                </div>
              ) : null}
            </div>
          </section>

          <section className="a-form-section">
            <h3 className="a-form-section__title">基本信息</h3>
            <div className="a-desc">
              <div className="a-desc__item">
                <span className="a-desc__label">机构名称</span>
                <span className="a-desc__value">{application.companyName}</span>
              </div>
              <div className="a-desc__item">
                <span className="a-desc__label">统一社会信用代码</span>
                <span className="a-desc__value">{application.creditCode || "—"}</span>
              </div>
              <div className="a-desc__item a-desc__item--wide">
                <span className="a-desc__label">联系地址</span>
                <span className="a-desc__value">{application.address || "—"}</span>
              </div>
              <div className="a-desc__item">
                <span className="a-desc__label">合作起止</span>
                <span className="a-desc__value">
                  {application.contractStart} ~ {application.contractEnd}
                </span>
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
            </div>
          </section>

          <section className="a-form-section">
            <h3 className="a-form-section__title">联系信息</h3>
            <div className="a-desc">
              <div className="a-desc__item">
                <span className="a-desc__label">联系人姓名</span>
                <span className="a-desc__value">{application.contactName}</span>
              </div>
              <div className="a-desc__item">
                <span className="a-desc__label">联系人手机号</span>
                <span className="a-desc__value">
                  <MaskedPhone phone={application.contactPhone} />
                </span>
              </div>
            </div>
          </section>

          <section className="a-form-section">
            <h3 className="a-form-section__title">登录账号</h3>
            <div className="a-desc">
              <div className="a-desc__item">
                <span className="a-desc__label">申请账号</span>
                <span className="a-desc__value">{application.account}</span>
              </div>
            </div>
          </section>

          {!readOnly ? (
            <section className="a-form-section">
              <h3 className="a-form-section__title">审核处理</h3>
              <div className="a-inline-actions" style={{ marginBottom: 12 }}>
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
                  审核拒绝
                </label>
              </div>

              {decision === "approve" ? (
                <div className="a-stack">
                  <div className="a-field__hint">
                    审核通过后将创建客户账号。产品配置为可选项：可在此开通产品，也可通过后在「编辑产品服务」中配置。
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
                    拒绝原因 <span className="a-req">*</span>
                  </span>
                  <textarea
                    className="a-textarea"
                    rows={4}
                    placeholder="请填写拒绝原因，将反馈给客户"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                </div>
              )}
            </section>
          ) : null}

          {error ? <div className="a-form-error">{error}</div> : null}

          {!readOnly ? (
            <div className="a-inline-actions">
              <button type="button" className="a-btn a-btn--primary" onClick={submit}>
                {decision === "approve" ? "确认通过" : "确认拒绝"}
              </button>
              <button type="button" className="a-btn" onClick={() => navigate(listBackPath)}>
                取消
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
