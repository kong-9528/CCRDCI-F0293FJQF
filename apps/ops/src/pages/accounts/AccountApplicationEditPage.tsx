import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AccountProductConfigPanel } from "@/components/AccountProductConfigPanel";
import { useAccountsStore } from "@/lib/accountsStore";
import { useCustomerStore } from "@/lib/customersStore";
import {
  customerToProductConfig,
  defaultProductConfigForApplication,
  emptyProductConfig,
  type ProductConfigState,
} from "@/lib/productConfig";
import { getCurrentUser } from "@/lib/usersStore";

function resolveBackPath(
  from: string | null,
  application: { id: string; reviewer?: string },
) {
  if (from === "mine") return "/accounts/mine";
  if (from === "all") return "/accounts/all";
  if (from === "list") {
    const me = getCurrentUser()?.displayName ?? "";
    return application.reviewer === me ? "/accounts/mine" : "/accounts/all";
  }
  return `/accounts/${application.id}`;
}

export function AccountApplicationEditPage() {
  const { id = "" } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getApplicationById } = useAccountsStore();
  const { getById, saveProductConfig } = useCustomerStore();
  const application = getApplicationById(id);
  const customer = application?.customerId ? getById(application.customerId) : undefined;

  const [config, setConfig] = useState<ProductConfigState>(() => emptyProductConfig());
  const [error, setError] = useState<string | null>(null);

  const from = searchParams.get("from");
  const backPath = application ? resolveBackPath(from, application) : "/accounts/mine";
  const backLabel = from === "mine" || from === "all" || from === "list" ? "返回列表" : "返回详情";

  useEffect(() => {
    if (!application) return;
    if (customer) {
      setConfig(customerToProductConfig(customer));
    } else {
      setConfig(defaultProductConfigForApplication(application));
    }
    setError(null);
  }, [application, customer]);

  if (!application) {
    return (
      <div className="a-card">
        <div className="a-card__head">配置技术服务</div>
        <div className="a-card__body">
          <div className="a-empty">未找到该申请记录</div>
        </div>
      </div>
    );
  }

  if (application.status !== "approved") {
    return <Navigate to={`/accounts/${application.id}`} replace />;
  }

  const defaultRange =
    customer?.contractStart && customer?.contractEnd
      ? { startDate: customer.contractStart, endDate: customer.contractEnd }
      : application.contractStart && application.contractEnd
        ? { startDate: application.contractStart, endDate: application.contractEnd }
        : undefined;

  const goBack = () => navigate(backPath);

  const submit = () => {
    if (!customer) {
      setError("未找到关联机构账号，无法保存");
      return;
    }
    const err = saveProductConfig(customer.id, config);
    if (err) {
      setError(err);
      return;
    }
    goBack();
  };

  return (
    <div className="a-stack">
      <div className="a-card">
        <div className="a-card__head">
          配置技术服务 · {application.companyName}
          <div className="a-card__extra">
            <button type="button" className="a-btn a-btn--sm" onClick={goBack}>
              {backLabel}
            </button>
          </div>
        </div>
        <div className="a-card__body a-stack">
          {!customer ? (
            <div className="a-empty">未找到关联机构账号，无法配置技术服务</div>
          ) : (
            <AccountProductConfigPanel
              value={config}
              onChange={setConfig}
              defaultRange={defaultRange}
              mode="edit"
              showUsed
              showStatus
            />
          )}

          {error ? <div className="a-form-error">{error}</div> : null}

          {customer ? (
            <div className="a-inline-actions">
              <button type="button" className="a-btn a-btn--primary" onClick={submit}>
                保存
              </button>
              <button type="button" className="a-btn" onClick={goBack}>
                取消
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
