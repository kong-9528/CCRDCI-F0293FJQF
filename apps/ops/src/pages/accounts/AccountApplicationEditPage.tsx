import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { AccountProductConfigPanel } from "@/components/AccountProductConfigPanel";
import { useAccountsStore } from "@/lib/accountsStore";
import { useCustomerStore } from "@/lib/customersStore";
import {
  customerToProductConfig,
  defaultProductConfigForApplication,
  emptyProductConfig,
  type ProductConfigState,
} from "@/lib/productConfig";

export function AccountApplicationEditPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { getApplicationById } = useAccountsStore();
  const { getById, saveProductConfig } = useCustomerStore();
  const application = getApplicationById(id);
  const customer = application?.customerId ? getById(application.customerId) : undefined;

  const [config, setConfig] = useState<ProductConfigState>(() => emptyProductConfig());
  const [error, setError] = useState<string | null>(null);

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
        <div className="a-card__head">编辑产品服务</div>
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
    navigate(`/accounts/${application.id}`);
  };

  return (
    <div className="a-stack">
      <div className="a-card">
        <div className="a-card__head">
          编辑产品服务 · {application.companyName}
          <div className="a-card__extra">
            <button
              type="button"
              className="a-btn a-btn--sm"
              onClick={() => navigate(`/accounts/${application.id}`)}
            >
              返回详情
            </button>
          </div>
        </div>
        <div className="a-card__body a-stack">
          <p className="a-field__hint" style={{ margin: 0 }}>
            {application.account} 的产品开通配置。已有产品不可移除，可新增配置或调整额度与有效期。
          </p>

          {!customer ? (
            <div className="a-empty">未找到关联机构账号，无法编辑产品服务</div>
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
              <button
                type="button"
                className="a-btn"
                onClick={() => navigate(`/accounts/${application.id}`)}
              >
                取消
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
