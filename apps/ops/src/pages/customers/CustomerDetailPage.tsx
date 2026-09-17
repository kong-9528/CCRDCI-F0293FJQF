import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ProductVerifyOptions } from "@/components/ProductVerifyOptions";
import { TableAction } from "@/components/TableAction";
import { IconDisable, IconEnable } from "@/components/icons/UiIcons";
import {
  ACCOUNT_STATUS_LABEL,
  CUSTOMER_TYPE_LABEL,
  SERVICE_STATUS_LABEL,
  deriveServiceStatus,
  formatQuota,
  isVerifyProduct,
  productName,
  resolveAuditServicePackage,
  resolveServicePackages,
  type ServicePackage,
} from "@/lib/catalog";
import { useCustomerStore } from "@/lib/customersStore";
import { actionTypeLabel, getCustomerPortalLogs } from "@/lib/opLogsStore";

type TabKey = "detail" | "usage" | "logs";

function serviceStatusTagClass(
  status: keyof typeof SERVICE_STATUS_LABEL,
) {
  if (status === "active") return "a-tag--ok";
  if (status === "pending" || status === "over_quota") return "a-tag--wn";
  if (status === "stopped") return "a-tag--er";
  return "a-tag--muted";
}

export function CustomerDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { getById, getUsage, setPackageStopped } = useCustomerStore();
  const customer = getById(id);
  const [tab, setTab] = useState<TabKey>("detail");
  const [logPage, setLogPage] = useState(1);
  const logPageSize = 10;
  const [confirmPkg, setConfirmPkg] = useState<ServicePackage | null>(null);

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
          <div className="a-empty">未找到该机构账号</div>
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
                  <span className="a-desc__label">机构名称</span>
                  <span className="a-desc__value">{customer.companyName}</span>
                </div>
                <div className="a-desc__item">
                  <span className="a-desc__label">统一社会信用代码</span>
                  <span className="a-desc__value">{customer.creditCode || "—"}</span>
                </div>
                <div className="a-desc__item">
                  <span className="a-desc__label">联系地址</span>
                  <span className="a-desc__value">{customer.address || "—"}</span>
                </div>
                <div className="a-desc__item">
                  <span className="a-desc__label">联系人姓名</span>
                  <span className="a-desc__value">{customer.contactName}</span>
                </div>
                <div className="a-desc__item">
                  <span className="a-desc__label">联系人手机号</span>
                  <span className="a-desc__value">{customer.contactPhone}</span>
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
              <h3 className="a-form-section__title">核验技术服务套餐</h3>
              <div className="a-field__hint" style={{ marginBottom: 8 }}>
                套餐包统一设定额度与生效起止，仅面向三类核验技术服务；包内服务共享该额度。
              </div>
              {(() => {
                const packages = resolveServicePackages(customer);
                if (packages.length === 0) {
                  return <div className="a-empty">暂无核验技术服务套餐配置</div>;
                }
                return (
                  <div className="a-stack" style={{ gap: 14 }}>
                    {packages.map((pkg) => {
                      const status = deriveServiceStatus(pkg);
                      return (
                        <article key={pkg.id} className="a-service-package a-service-package--readonly">
                          <header className="a-service-package__head">
                            <div className="a-service-package__title-row">
                              <span className="a-service-package__badge">套餐包</span>
                              <strong>{pkg.name || "未命名套餐"}</strong>
                            </div>
                            <div className="a-service-package__meta">
                              <span>额度：{formatQuota(pkg)}</span>
                              <span>
                                生效：{pkg.startDate} ~ {pkg.endDate}
                              </span>
                              <span className={`a-tag ${serviceStatusTagClass(status)}`}>
                                {SERVICE_STATUS_LABEL[status]}
                              </span>
                              <div className="a-actions">
                                <TableAction
                                  icon={pkg.stopped ? <IconEnable /> : <IconDisable />}
                                  disabled={pkg.stopped && pkg.services.length === 0}
                                  title={
                                    pkg.stopped && pkg.services.length === 0
                                      ? "请先在配置页为该套餐包添加核验技术服务后再恢复"
                                      : undefined
                                  }
                                  onClick={() => setConfirmPkg(pkg)}
                                >
                                  {pkg.stopped ? "恢复" : "停止"}
                                </TableAction>
                              </div>
                            </div>
                          </header>
                          <div className="a-service-package__body">
                            <div className="a-table-wrap">
                              <table className="a-table a-table--compact">
                                <thead>
                                  <tr>
                                    <th>技术服务</th>
                                    <th>开通明细</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {pkg.services.length === 0 ? (
                                    <tr>
                                      <td colSpan={2}>
                                        <div className="a-empty" style={{ padding: "10px 0" }}>
                                          暂无技术服务
                                          {pkg.stopped ? "（已停止）" : ""}
                                        </div>
                                      </td>
                                    </tr>
                                  ) : (
                                    pkg.services.map((svc) => (
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
                                      </tr>
                                    ))
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                );
              })()}
            </section>

            <section className="a-form-section">
              <h3 className="a-form-section__title">作品智能辅助审核</h3>
              {(() => {
                const audit = resolveAuditServicePackage(customer);
                if (!audit) {
                  return <div className="a-empty">尚未开通作品智能辅助审核</div>;
                }
                const status = deriveServiceStatus({
                  ...audit,
                  product: "workReview",
                });
                return (
                  <article className="a-service-package a-service-package--readonly a-audit-service-card">
                    <header className="a-service-package__head">
                      <div className="a-service-package__title-row">
                        <span className="a-service-package__badge">技术服务</span>
                        <strong>作品智能辅助审核</strong>
                      </div>
                      <div className="a-service-package__meta">
                        <span>额度：{formatQuota(audit)}</span>
                        <span>
                          生效：{audit.startDate} ~ {audit.endDate}
                        </span>
                        <span className={`a-tag ${serviceStatusTagClass(status)}`}>
                          {SERVICE_STATUS_LABEL[status]}
                        </span>
                        <div className="a-actions">
                          <TableAction
                            icon={audit.stopped ? <IconEnable /> : <IconDisable />}
                            onClick={() => setConfirmPkg(audit)}
                          >
                            {audit.stopped ? "恢复" : "停止"}
                          </TableAction>
                        </div>
                      </div>
                    </header>
                  </article>
                );
              })()}
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
                              : row.serviceStatus === "pending" ||
                                  row.serviceStatus === "over_quota"
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
        open={Boolean(confirmPkg)}
        title={confirmPkg?.stopped ? "确认恢复套餐" : "确认停止套餐"}
        description={
          confirmPkg
            ? `确定要${confirmPkg.stopped ? "恢复" : "停止"}账号「${customer.account}」的技术服务套餐「${confirmPkg.name || "未命名套餐"}」吗？停止后包内服务均不可调用。`
            : ""
        }
        confirmText={confirmPkg?.stopped ? "恢复" : "停止"}
        danger={!confirmPkg?.stopped}
        onCancel={() => setConfirmPkg(null)}
        onConfirm={() => {
          if (!confirmPkg) return;
          setPackageStopped(customer.id, confirmPkg.id, !confirmPkg.stopped);
          setConfirmPkg(null);
        }}
      />
    </div>
  );
}
