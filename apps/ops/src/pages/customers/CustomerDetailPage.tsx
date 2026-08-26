import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  ACCOUNT_STATUS_LABEL,
  CUSTOMER_TYPE_LABEL,
  SERVICE_STATUS_LABEL,
  deriveServiceStatus,
  formatQuota,
  productName,
  type ProductServiceConfig,
} from "@/lib/catalog";
import { useCustomerStore } from "@/lib/customersStore";
import { actionTypeLabel, getCustomerPortalLogs } from "@/lib/opLogsStore";

type TabKey = "detail" | "usage" | "logs";

function serviceStatusTagClass(
  status: keyof typeof SERVICE_STATUS_LABEL,
) {
  if (status === "active") return "a-tag--ok";
  if (status === "pending") return "a-tag--wn";
  if (status === "stopped") return "a-tag--muted";
  return "a-tag--er";
}

export function CustomerDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { getById, getUsage, setProductStopped } = useCustomerStore();
  const customer = getById(id);
  const [tab, setTab] = useState<TabKey>("detail");
  const [logPage, setLogPage] = useState(1);
  const logPageSize = 10;
  const [confirmSvc, setConfirmSvc] = useState<ProductServiceConfig | null>(null);

  const logs = useMemo(
    () => (customer ? getCustomerPortalLogs(customer.id) : []),
    [customer],
  );
  const usage = useMemo(
    () => (customer ? getUsage(customer) : []),
    [customer, getUsage],
  );

  const logTotalPages = Math.max(1, Math.ceil(logs.length / logPageSize));
  const logRows = logs.slice((logPage - 1) * logPageSize, logPage * logPageSize);

  if (!customer) {
    return (
      <div className="a-card">
        <div className="a-card__head">客户详情</div>
        <div className="a-card__body">
          <div className="a-empty">未找到该客户账号</div>
        </div>
      </div>
    );
  }

  return (
    <div className="a-stack">
      <div className="a-card">
        <div className="a-card__head">
          客户详情 · {customer.account}
          <div className="a-card__extra a-inline-actions">
            <button
              type="button"
              className="a-btn a-btn--sm"
              onClick={() => navigate(`/customers/${customer.id}/edit`)}
            >
              编辑
            </button>
            <button type="button" className="a-btn a-btn--sm" onClick={() => navigate("/customers")}>
              返回列表
            </button>
          </div>
        </div>

        <div className="a-tabs" role="tablist">
          {(
            [
              ["detail", "详情信息"],
              ["usage", "使用统计"],
              ["logs", "操作日志"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              className={`a-tabs__item${tab === key ? " is-active" : ""}`}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "detail" ? (
          <div className="a-card__body a-stack">
            <section className="a-form-section">
              <h3 className="a-form-section__title">客户信息</h3>
              <div className="a-desc">
                <div className="a-desc__item">
                  <span className="a-desc__label">客户类型</span>
                  <span className="a-desc__value">
                    {CUSTOMER_TYPE_LABEL[customer.customerType]}
                  </span>
                </div>
                <div className="a-desc__item">
                  <span className="a-desc__label">统一社会信用代码</span>
                  <span className="a-desc__value">{customer.creditCode}</span>
                </div>
                <div className="a-desc__item">
                  <span className="a-desc__label">公司全称</span>
                  <span className="a-desc__value">{customer.companyName}</span>
                </div>
                <div className="a-desc__item">
                  <span className="a-desc__label">法人代表</span>
                  <span className="a-desc__value">{customer.legalPerson || "—"}</span>
                </div>
                <div className="a-desc__item">
                  <span className="a-desc__label">联系人姓名</span>
                  <span className="a-desc__value">{customer.contactName}</span>
                </div>
                <div className="a-desc__item">
                  <span className="a-desc__label">联系人电话</span>
                  <span className="a-desc__value">{customer.contactPhone}</span>
                </div>
                <div className="a-desc__item">
                  <span className="a-desc__label">联系人邮箱</span>
                  <span className="a-desc__value">{customer.contactEmail}</span>
                </div>
                <div className="a-desc__item">
                  <span className="a-desc__label">有效联系地址</span>
                  <span className="a-desc__value">{customer.address || "—"}</span>
                </div>
              </div>
            </section>

            <section className="a-form-section">
              <h3 className="a-form-section__title">账号信息</h3>
              <div className="a-desc">
                <div className="a-desc__item">
                  <span className="a-desc__label">账号</span>
                  <span className="a-desc__value">
                    <code>{customer.account}</code>
                  </span>
                </div>
                <div className="a-desc__item">
                  <span className="a-desc__label">账号状态</span>
                  <span className="a-desc__value">
                    <span
                      className={`a-tag${customer.status === "enabled" ? " a-tag--ok" : " a-tag--er"}`}
                    >
                      {ACCOUNT_STATUS_LABEL[customer.status]}
                    </span>
                  </span>
                </div>
                <div className="a-desc__item">
                  <span className="a-desc__label">创建时间</span>
                  <span className="a-desc__value">{customer.createdAt}</span>
                </div>
                <div className="a-desc__item">
                  <span className="a-desc__label">更新时间</span>
                  <span className="a-desc__value">{customer.updatedAt}</span>
                </div>
              </div>
            </section>

            <section className="a-form-section">
              <h3 className="a-form-section__title">产品服务配置</h3>
              <div className="a-field__hint" style={{ marginBottom: 8 }}>
                产品额度仅在产品有效期内可消耗；过期后次数保留但不可再使用（WebUI / API）。
                账号能否登录取决于账号状态（启用/停用）。
              </div>
              <div className="a-table-wrap">
                <table className="a-table">
                  <thead>
                    <tr>
                      <th>产品</th>
                      <th>额度</th>
                      <th>有效期</th>
                      <th>服务状态</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.productServices.length === 0 ? (
                      <tr>
                        <td colSpan={5}>
                          <div className="a-empty">暂无产品服务配置</div>
                        </td>
                      </tr>
                    ) : (
                      customer.productServices.map((svc) => {
                        const status = deriveServiceStatus(svc);
                        return (
                          <tr key={svc.product}>
                            <td>{productName(svc.product)}</td>
                            <td>{formatQuota(svc)}</td>
                            <td>
                              {svc.startDate} ~ {svc.endDate}
                            </td>
                            <td>
                              <span className={`a-tag ${serviceStatusTagClass(status)}`}>
                                {SERVICE_STATUS_LABEL[status]}
                              </span>
                            </td>
                            <td>
                              <div className="a-actions">
                                <button
                                  type="button"
                                  className="a-btn a-btn--text a-btn--sm"
                                  onClick={() => setConfirmSvc(svc)}
                                >
                                  {svc.stopped ? "恢复" : "停止"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        ) : null}

        {tab === "usage" ? (
          <div className="a-card__body a-card__body--flush">
            <table className="a-table">
              <thead>
                <tr>
                  <th>账号</th>
                  <th>产品</th>
                  <th>产品服务状态</th>
                  <th>历史累积调用次数</th>
                </tr>
              </thead>
              <tbody>
                {usage.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="a-empty">暂无产品使用数据</div>
                    </td>
                  </tr>
                ) : (
                  usage.map((row) => (
                    <tr key={row.product}>
                      <td>
                        <code>{row.account}</code>
                      </td>
                      <td>{productName(row.product)}</td>
                      <td>
                        <span
                          className={`a-tag ${
                            row.serviceStatus === "active"
                              ? "a-tag--ok"
                              : row.serviceStatus === "pending"
                                ? "a-tag--wn"
                                : "a-tag--er"
                          }`}
                        >
                          {SERVICE_STATUS_LABEL[row.serviceStatus]}
                        </span>
                      </td>
                      <td className="num">{row.totalCalls.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : null}

        {tab === "logs" ? (
          <div className="a-card__body a-card__body--flush">
            <table className="a-table">
              <thead>
                <tr>
                  <th>操作类型</th>
                  <th>操作内容</th>
                  <th>操作人</th>
                  <th>操作时间</th>
                </tr>
              </thead>
              <tbody>
                {logRows.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="a-empty">暂无操作日志</div>
                    </td>
                  </tr>
                ) : (
                  logRows.map((log) => (
                    <tr key={log.id}>
                      <td>{actionTypeLabel("portal", log.actionType)}</td>
                      <td>{log.content}</td>
                      <td>
                        <code>{log.operator}</code>
                      </td>
                      <td>{log.operatedAt}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="a-pagination">
              <span>
                共 {logs.length} 条 · 第 {logPage}/{logTotalPages} 页
              </span>
              <button
                type="button"
                disabled={logPage <= 1}
                onClick={() => setLogPage((p) => Math.max(1, p - 1))}
              >
                上一页
              </button>
              <button
                type="button"
                disabled={logPage >= logTotalPages}
                onClick={() => setLogPage((p) => Math.min(logTotalPages, p + 1))}
              >
                下一页
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        open={Boolean(confirmSvc)}
        title={confirmSvc?.stopped ? "确认恢复服务" : "确认停止服务"}
        description={
          confirmSvc
            ? `确定要${confirmSvc.stopped ? "恢复" : "停止"}账号「${customer.account}」的产品「${productName(confirmSvc.product)}」吗？`
            : ""
        }
        confirmText={confirmSvc?.stopped ? "恢复" : "停止"}
        danger={!confirmSvc?.stopped}
        onCancel={() => setConfirmSvc(null)}
        onConfirm={() => {
          if (!confirmSvc) return;
          setProductStopped(customer.id, confirmSvc.product, !confirmSvc.stopped);
          setConfirmSvc(null);
        }}
      />
    </div>
  );
}
